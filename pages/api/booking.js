import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function isWorkday(dateStr){
  const d = dayjs(dateStr);
  const day = d.day(); // 0 Sun .. 6 Sat
  return day >= 1 && day <= 6; // Mon-Sat
}

function allSlots(){
  const slots=[];
  let d = dayjs('2020-01-01 09:30');
  const end = dayjs('2020-01-01 18:00');
  while(d.isBefore(end) || d.isSame(end)){
    slots.push(d.format('HH:mm'));
    d = d.add(30, 'minute');
  }
  return slots;
}

async function ensureSlots(dateStr){
  // if slots for date do not exist, create them (available=true)
  const { data: existing, error: err1 } = await supabase.from('slots').select('id').eq('date', dateStr).limit(1);
  if(err1) throw err1;
  if(existing && existing.length>0) return;
  const base = allSlots().map(t => ({ date: dateStr, time: t, available: true }));
  const { error: err2 } = await supabase.from('slots').insert(base);
  if(err2) throw err2;
}

function buildMailTransport(){
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
}

function customerConfirmation(firstname, date, time){
  return {
    subject: 'Votre réservation ArCutz',
    text: `Bonjour ${firstname},\n\nVotre réservation est confirmée pour le ${dayjs(date).format('DD/MM/YYYY')} à ${time}.\nAdresse: 12 Rue des Ciseaux, 75000 Paris\nPrix: 20€\n\nA bientôt !`,
    html: `<p>Bonjour <b>${firstname}</b>,</p>
      <p>Votre réservation est confirmée pour le <b>${dayjs(date).format('DD/MM/YYYY')}</b> à <b>${time}</b>.</p>
      <p><b>Adresse :</b> 12 Rue des Ciseaux, 75000 Paris</p>
      <p><b>Prix :</b> 20€</p>
      <p>À bientôt !</p>`
  };
}
function adminRecap(data){
  return {
    subject: 'Nouvelle réservation',
    text: `Nouvelle réservation: ${data.firstname} (${data.email}) - ${data.date} ${data.time}`,
    html: `<p><b>Nouvelle réservation</b></p>
           <p>${data.firstname} (${data.email})</p>
           <p>${dayjs(data.date).format('DD/MM/YYYY')} à ${data.time}</p>`
  };
}

export default async function handler(req, res){
  if(req.method === 'GET'){
    try{
      const date = String(req.query.date || '');
      if(!date || !isWorkday(date)) return res.status(200).json({ available: [] });
      await ensureSlots(date);
      // available times for that date
      const { data, error } = await supabase.from('slots')
        .select('time, available').eq('date', date).order('time');
      if(error) throw error;
      const remaining = (data||[]).filter(r => r.available).map(r => r.time);
      return res.status(200).json({ available: remaining });
    }catch(e){
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  if(req.method === 'POST'){
    try{
      const { firstname, email, date, time, captcha } = req.body || {};
      if(!firstname || !email || !date || !time) return res.status(400).json({ message: 'Champs manquants' });
      if(!isWorkday(date)) return res.status(400).json({ message: 'Jour non réservable (lun–sam uniquement)' });
      // captcha
      const sum = Number((captcha?.a||0)) + Number((captcha?.b||0));
      if(String(sum) !== String(captcha?.answer||'')) return res.status(400).json({ message:'Captcha invalide' });

      // ensure slots exist
      await ensureSlots(date);
      // check slot availability, mark unavailable in a single transaction-like sequence
      const { data: found, error: findErr } = await supabase.from('slots').select('*')
        .eq('date', date).eq('time', time).maybeSingle();
      if(findErr) throw findErr;
      if(!found || !found.available) return res.status(409).json({ message:'Créneau déjà réservé' });

      const { error: updErr } = await supabase.from('slots')
        .update({ available:false }).eq('id', found.id);
      if(updErr) throw updErr;

      const { data: newRes, error: insErr } = await supabase.from('reservations').insert({
        firstname, email, date, time
      }).select().single();
      if(insErr) throw insErr;

      // send emails
      const transporter = buildMailTransport();
      const customer = customerConfirmation(firstname, date, time);
      await transporter.sendMail({ from: process.env.GMAIL_USER, to: email, ...customer });
      const admin = adminRecap({ firstname, email, date, time });
      await transporter.sendMail({ from: process.env.GMAIL_USER, to: process.env.GMAIL_USER, ...admin });

      return res.status(200).json({ message: 'Réservation confirmée. Un email vous a été envoyé.' });
    }catch(e){
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur. Réservation non effectuée.' });
    }
  }

  res.setHeader('Allow', ['GET','POST']);
  return res.status(405).end('Method Not Allowed');
}
