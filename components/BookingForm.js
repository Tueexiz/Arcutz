import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import validator from 'validator';

const API = '/api/booking';

function buildSlots(start='09:30', end='18:00'){
  // returns array of "HH:mm" every 30 min
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const slots = [];
  let d = dayjs().hour(sh).minute(sm).second(0).millisecond(0);
  const endD = dayjs().hour(eh).minute(em).second(0).millisecond(0);
  while(d.isBefore(endD) || d.isSame(endD)){
    slots.push(d.format('HH:mm'));
    d = d.add(30, 'minute');
  }
  return slots;
}

export default function BookingForm(){
  const [firstname, setFirstname] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(dayjs().add(1,'day').format('YYYY-MM-DD')); // default tomorrow
  const [available, setAvailable] = useState([]);
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [captchaQ, setCaptchaQ] = useState({a:0,b:0});
  const [captchaAns, setCaptchaAns] = useState('');
  const [hp, setHp] = useState(''); // honeypot

  const allSlots = useMemo(()=>buildSlots('09:30', '18:00'), []);

  useEffect(()=>{
    // generate captcha
    setCaptchaQ({a:Math.ceil(Math.random()*5)+2, b:Math.ceil(Math.random()*5)+1});
  },[]);

  useEffect(()=>{
    async function fetchSlots(){
      try{
        const u = new URL(API, window.location.origin);
        u.searchParams.set('date', date);
        const res = await fetch(u);
        const data = await res.json();
        if(res.ok){
          setAvailable(data.available || []);
        }else{
          setAvailable([]);
        }
      }catch(e){ setAvailable([]); }
    }
    fetchSlots();
  }, [date]);

  const remaining = allSlots.filter(s => available.includes(s));

  async function submit(e){
    e.preventDefault();
    setStatus(null);
    if(!firstname.trim()) return setStatus({ok:false, msg:'Prénom requis.'});
    if(!validator.isEmail(email)) return setStatus({ok:false, msg:'Email invalide.'});
    if(!time) return setStatus({ok:false, msg:'Choisissez un créneau.'});
    if(hp) return setStatus({ok:false, msg:'Spam détecté.'});
    if(String(Number(captchaAns)) !== String(captchaQ.a + captchaQ.b)) return setStatus({ok:false, msg:'Captcha incorrect.'});

    setLoading(true);
    try{
      const res = await fetch(API, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ firstname, email, date, time, captcha: { a:captchaQ.a, b:captchaQ.b, answer:captchaAns } })
      });
      const data = await res.json();
      setStatus({ok:res.ok, msg:data.message || (res.ok ? 'Réservation confirmée !' : 'Erreur')});
      if(res.ok){
        setFirstname(''); setEmail(''); setTime('');
        // refresh slots
        const u = new URL(API, window.location.origin);
        u.searchParams.set('date', date);
        const r2 = await fetch(u); const d2 = await r2.json();
        setAvailable(d2.available || []);
      }
    }catch(err){
      setStatus({ok:false, msg:'Erreur réseau.'});
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="glass card">
      <h3 style={{marginTop:0}}>Réserver une coupe <span className="badge">20€</span></h3>
      <form onSubmit={submit}>
        <div className="formRow">
          <div>
            <label>Prénom</label>
            <input className="input" value={firstname} onChange={e=>setFirstname(e.target.value)} placeholder="Votre prénom" required />
          </div>
          <div>
            <label>Email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com" type="email" required />
          </div>
        </div>

        <div className="formRow" style={{marginTop:12}}>
          <div>
            <label>Date</label>
            <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} min={dayjs().format('YYYY-MM-DD')} required />
          </div>
          <div>
            <label>Créneau (30 min)</label>
            <select className="select" value={time} onChange={e=>setTime(e.target.value)} required>
              <option value="">Choisir...</option>
              {remaining.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* captcha */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
          <div style={{display:'none'}}>
            <input value={hp} onChange={e=>setHp(e.target.value)} placeholder="Ne pas remplir" />
          </div>
          <div>
            <label>Captcha anti-spam: {captchaQ.a} + {captchaQ.b} = ?</label>
            <input className="input" value={captchaAns} onChange={e=>setCaptchaAns(e.target.value)} placeholder="Votre réponse" required />
          </div>
          <div style={{display:'flex', alignItems:'flex-end', justifyContent:'flex-end'}}>
            <button className="button" type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Confirmer'}</button>
          </div>
        </div>

        {status && <p style={{marginTop:10, color: status.ok ? '#065f46' : '#b91c1c'}}>{status.msg}</p>}
      </form>
    </div>
  )
}
