"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { AboutDishCards } from "@/components/about/AboutHub";
import { menuItems, itemName, type MenuItem } from "@/data/menu";
import { restaurant, telHref } from "@/data/restaurant";
import type { Locale } from "@/lib/i18n";
import { suggest } from "./MasterChef";
import s from "./chef-workspace.module.css";
const choices=[{id:'light',label:'Leicht & frisch',icon:'leaf'},{id:'hearty',label:'Herzhaft',icon:'utensils'},{id:'sushi',label:'Sushi',icon:'utensils'},{id:'vegetarian',label:'Vegetarisch',icon:'leaf'},{id:'surprise',label:'Überrasch mich',icon:'sparkles'}] as const;
type Choice=typeof choices[number]['id'];
type Answer={question:string;answer:string;dishes:MenuItem[];service:boolean};
function fromMenu(question:string,locale:Locale) {
 const q=question.toLowerCase();
 if(/allerg|gluten|nuss|erdnuss|dị ứng/.test(q))return [];
 if(/vegetar|chay/.test(q))return suggest('vegetarian',0);
 if(/sushi/.test(q))return suggest('sushi',0);
 if(/leicht|frisch|nhẹ/.test(q))return suggest('light',0);
 if(/herzhaft|hunger|no bụng/.test(q))return suggest('hearty',0);
 const words=q.split(/\s+/).filter(x=>x.length>2);
 return menuItems.filter(m=>m.available&&words.some(x=>itemName(m,locale).toLowerCase().includes(x))).slice(0,3);
}
export function ChefWorkspace({locale}:{locale:Locale}) {
 const [choice,setChoice]=useState<Choice>('light');const [nonce,setNonce]=useState(0);
 const [query,setQuery]=useState('');const [busy,setBusy]=useState(false);const [answers,setAnswers]=useState<Answer[]>([]);
 const recommendations=suggest(choice,nonce);
 async function ask() {
  const question=query.trim();if(!question||busy)return;setBusy(true);setQuery('');
  let dishes=fromMenu(question,locale);let service=/allerg|gluten|nuss|erdnuss|dị ứng/i.test(question);
  let answer=dishes.length?'Diese Vorschläge kommen aus unserer Speisekarte. Öffne ein Gericht für Zutaten, Varianten und Preise.':'Dazu kann ich keine sichere Empfehlung aus unserer Speisekarte ableiten. Unser Service hilft dir gern weiter.';
  try {
   const response=await fetch('/api/chef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cauHoi:question,locale,trang:'master-chef'}),signal:AbortSignal.timeout(23000)});
   if(response.ok){const data=await response.json();if(data.nguon==='gemini'){
    service=service||Boolean(data.canHoiNhanVien);
    dishes=(Array.isArray(data.monIds)?data.monIds:[]).map((id:string)=>menuItems.find(m=>m.id===id&&m.available)).filter((m:MenuItem|undefined):m is MenuItem=>Boolean(m)).slice(0,3);
    if(typeof data.cauTraLoi==='string'&&data.cauTraLoi.trim())answer=data.cauTraLoi;
   }}
  }catch { /* Menu suggestions remain available when the service is unavailable. */ }
  if(service){dishes=[];answer='Bei Allergien oder Unverträglichkeiten bitte direkt mit unserem Service sprechen. Zutaten und mögliche Kreuzkontakte müssen vor Ort bestätigt werden.';}
  setAnswers(a=>[...a,{question,answer,dishes,service}]);setBusy(false);
 }
 return <section className={s.workspace}>
  <div className={s.intro}><div><p className="sora-eyebrow">Dein persönlicher Genussbegleiter</p><h2>Worauf hast du heute Lust?</h2><p>Wähle deinen Geschmack oder stell eine Frage. Entdecke passende Gerichte und öffne direkt die Details auf unserer Speisekarte.</p></div><Icon name="chef" size={70}/></div>
  <div className={s.choices} role="group" aria-label="Geschmack wählen">{choices.map(c=><button key={c.id} type="button" aria-pressed={choice===c.id} onClick={()=>{setChoice(c.id);setNonce(0);}}><Icon name={c.icon} size={19}/>{c.label}</button>)}</div>
  <div className={s.resultsHead}><h3>Aus unserer Speisekarte</h3><button type="button" onClick={()=>setNonce(n=>n+1)}>Andere Vorschläge<Icon name="arrow-right" size={17}/></button></div>
  <div data-chef-recommendations=""><AboutDishCards dishes={recommendations} locale={locale}/></div>
  <div className={s.conversation}><h3>Frag den Master Chef</h3>
   <div aria-live="polite">{answers.map((a,i)=><article className={s.answer} key={i}><p className={s.question}>{a.question}</p><p>{a.answer}</p>{a.dishes.length>0&&<AboutDishCards dishes={a.dishes} locale={locale}/>} {a.service&&<a href={telHref(restaurant.phones[0])}>Service anrufen: {restaurant.phones[0].number}</a>}</article>)}</div>
   <form onSubmit={e=>{e.preventDefault();void ask();}}><label className="sr-only" htmlFor="chef-question">Deine Frage</label><textarea id="chef-question" maxLength={500} rows={2} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Zum Beispiel: Welche vegetarischen Gerichte gibt es?"/><button type="submit" disabled={busy||!query.trim()}><Icon name="send" size={20}/>{busy?'Einen Moment …':'Frage senden'}</button></form>
   <p className={s.note}>Bei Allergien und Unverträglichkeiten sprich bitte vor der Bestellung mit unserem Service.</p>
  </div>
 </section>;
}
