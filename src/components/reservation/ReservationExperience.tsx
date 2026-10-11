"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { KhungThongBao } from "@/components/ui/KhungThongBao";
import { restaurant, telHref, phoneLabel } from "@/data/restaurant";
import { pick, type Locale } from "@/lib/i18n";
import type { ReservationStrings } from "./ReservationForm";
import { RT } from "./text";
import styles from "./reservation.module.css";

const minute = (value: string) => { const [h,m]=value.split(":").map(Number); return h*60+m; };
function berlinDate() {
  const parts=new Intl.DateTimeFormat("en",{timeZone:"Europe/Berlin",year:"numeric",month:"numeric",day:"numeric"}).formatToParts(new Date());
  const get=(name:string)=>Number(parts.find(p=>p.type===name)?.value);
  return new Date(get("year"),get("month")-1,get("day"));
}
const sessions=[{id:"mittag",start:0,end:900},{id:"nachmittag",start:900,end:1080},{id:"abend",start:1080,end:1440}] as const;
const label=(value:string)=>value.replace(/^\d+[.\s]+/,"");

export function ReservationForm({locale,s}:{locale:Locale;s:ReservationStrings}) {
  const today=useMemo(()=>berlinDate(),[]);
  const [month,setMonth]=useState(()=>new Date(today.getFullYear(),today.getMonth(),1));
  const [date,setDate]=useState<Date|null>(null);
  const [time,setTime]=useState<string|null>(null);
  const [guests,setGuests]=useState(2);
  const [area,setArea]=useState<string|null>(null);
  const [occasion,setOccasion]=useState<string|null>(null);
  const [notes,setNotes]=useState("");
  const [session,setSession]=useState<(typeof sessions)[number]["id"]>("abend");
  const [copyStatus,setCopyStatus]=useState("");
  const hours=restaurant.openingHours.schema[0];
  const slots=useMemo(()=>{
    const out:string[]=[];
    for(let n=minute(hours.open);n<=minute(hours.close)-30;n+=30)out.push(`${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`);
    return out;
  },[hours]);
  const current=sessions.find(b=>b.id===session)!;
  const fmtDate=(d:Date)=>new Intl.DateTimeFormat(locale==="vi"?"vi-VN":"de-DE",{day:"2-digit",month:"long",year:"numeric"}).format(d);
  const selectedArea=s.areas.find(a=>a.id===area);
  const optional=locale==="vi"?"Không bắt buộc":"Optional";
  const summary=[
    [s.labels.date,date?fmtDate(date):s.notChosen],
    [s.labels.time,time??s.notChosen],
    [s.labels.guests,`${guests} ${guests===1?s.guest:s.guests}`],
    [s.labels.area,selectedArea?.name??s.notChosen],
    [s.labels.occasion,s.occasions.find(o=>o.id===occasion)?.label??s.notChosen],
  ];
  const copy=async()=>{
    try { await navigator.clipboard.writeText(summary.map(([name,value])=>`${name}: ${value}`).join("\n")+(notes.trim()?`\n${s.labels.notes}: ${notes.trim()}`:"")); setCopyStatus(locale==="vi"?"Đã sao chép thông tin":"Auswahl kopiert"); }
    catch { setCopyStatus(locale==="vi"?"Vui lòng đọc thông tin khi gọi điện":"Bitte Auswahl beim Anruf durchgeben."); }
  };
  return <div className={styles.layout} data-reservation-layout>
    <form className={styles.form} onSubmit={e=>e.preventDefault()}>
      {/* Câu dẫn nằm TRONG khung viền riêng, chạy trọn bề ngang phía trên cả hai cột
          (Sếp 11/10) — trước nó đứng trơ trên cột trái nên cột trái bắt đầu bằng
          chữ, cột phải bắt đầu bằng thẻ ảnh: lệch đỉnh 44px. */}
      <KhungThongBao className={styles.intro}><p>{locale==="vi"?"Chọn thời gian và số khách, sau đó gọi để xác nhận bàn.":"Wunschzeit und Gäste auswählen. Deinen Tisch bestätigen wir persönlich am Telefon."}</p></KhungThongBao>
      <div className={styles.topGrid}>
        <fieldset className={styles.panel}><legend className={styles.legend}><span>01</span>{label(s.steps[0])}</legend>
          <Calendar month={month} setMonth={setMonth} today={today} value={date} onPick={setDate} s={s} locale={locale}/>
          <p className={styles.selection}><Icon name="calendar" size={15}/>{date?fmtDate(date):locale==="vi"?"Chọn ngày bạn muốn đến":"Wähle deinen Wunschtag"}</p>
        </fieldset>
        <div className={`${styles.panel} ${styles.timePanel}`}>
          <fieldset><legend className={styles.legend}><span>02</span>{label(s.steps[1])}</legend>
            <div className={styles.sessions} aria-label={s.labels.time}>{sessions.map(b=><button key={b.id} type="button" aria-pressed={session===b.id} onClick={()=>setSession(b.id)}>{time&&minute(time)>=b.start&&minute(time)<b.end&&<Icon name="check" size={12}/>} {pick(RT[`buoi_${b.id}`],locale)}</button>)}</div>
            <div className={styles.times} data-luoi-gio>{slots.filter(t=>minute(t)>=current.start&&minute(t)<current.end).map(slot=><button key={slot} type="button" aria-pressed={time===slot} onClick={()=>setTime(slot)}>{slot}</button>)}</div>
            <p className={styles.selection}><Icon name="clock" size={15}/>{time?`${time} Uhr`:locale==="vi"?"Giờ đến mong muốn":"Deine gewünschte Ankunftszeit"}</p>
          </fieldset>
          <fieldset className={styles.guestSection}><legend className={styles.legend}><span>03</span>{label(s.steps[2])}</legend><div className={styles.counter}><button type="button" aria-label={pick(RT.guestsLess,locale)} disabled={guests<=1} onClick={()=>setGuests(n=>Math.max(1,n-1))}><Icon name="minus" size={19}/></button><output aria-live="polite" data-so-khach={guests}><Icon name="users" size={18}/>{guests} {guests===1?s.guest:s.guests}</output><button type="button" aria-label={pick(RT.guestsMore,locale)} disabled={guests>=12} onClick={()=>setGuests(n=>Math.min(12,n+1))}><Icon name="plus" size={19}/></button></div><KhungThongBao icon="users" className={styles.note}><p>{locale==="vi"?"Nhóm trên 12 người: vui lòng gọi trực tiếp.":"Für Gruppen über 12 Personen bitte direkt anrufen."}</p></KhungThongBao></fieldset>
        </div>
      </div>
      <fieldset className={`${styles.panel} ${styles.areaPanel}`}><legend className={styles.legend}><span>04</span>{label(s.labels.area)}<small>{optional}</small></legend><div className={styles.areas}>{s.areas.map(a=><button type="button" key={a.id} data-khu-vuc={a.id} aria-pressed={area===a.id} onClick={()=>setArea(area===a.id?null:a.id)}><span className={styles.areaPhoto}><Image src={a.photo} alt={a.alt} fill sizes="(max-width:767px) 45vw, 30vw"/></span><span className={styles.areaLabel}><span className={styles.radio}>{area===a.id&&<Icon name="check" size={13}/>}</span>{a.name}</span></button>)}</div><KhungThongBao className={styles.note}><p>{locale==="vi"?"Khu vực theo mong muốn; nhà hàng sẽ xác nhận bàn khi bạn gọi.":"Dein Bereichswunsch – die Tischvergabe bestätigen wir beim Anruf."}</p></KhungThongBao></fieldset>
      <div className={styles.bottomGrid}>
        <fieldset className={styles.panel}><legend className={styles.legend}><span>05</span>{s.labels.occasion}<small>{optional}</small></legend><div className={styles.occasions}>{s.occasions.map(o=><button key={o.id} type="button" aria-pressed={occasion===o.id} onClick={()=>setOccasion(occasion===o.id?null:o.id)}><Icon name={occasion===o.id?"check":o.icon} size={17}/>{o.label}</button>)}</div></fieldset>
        <fieldset className={styles.panel}><legend className={styles.legend}><span>06</span>{s.labels.notes}<small>{optional}</small></legend><textarea aria-label={s.labels.notes} value={notes} maxLength={500} rows={3} onChange={e=>setNotes(e.target.value)} placeholder={s.notesPlaceholder}/><p className={styles.charCount}>{notes.length}/500</p></fieldset>
      </div>
    </form>
    <aside className={styles.summary} data-tom-tat>
      <div className={styles.summaryPhoto}><Image src="/anh/restaurant-05.webp" alt="Gastraum im SoRa Restaurant" fill sizes="(max-width:1199px) 90vw, 360px"/></div>
      <div className={styles.summaryBody}><span className={styles.eyebrow}>DEIN BESUCH BEI SORA</span><h2>{s.summary}</h2><dl>{summary.map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}{notes.trim()&&<div><dt>{s.labels.notes}</dt><dd>{notes.trim()}</dd></div>}</dl>
        <KhungThongBao icon="phone" className={styles.noteSummary}><p>{locale==="vi"?"Gọi điện để xác nhận đặt bàn. Lựa chọn ở đây chưa giữ bàn.":"Telefonisch reservieren. Deine Auswahl ist noch keine bestätigte Buchung."}</p></KhungThongBao>
        <ul className={styles.phones}>{restaurant.phones.map((p,i)=><li key={p.e164}><a href={telHref(p)} className={i===0?styles.primaryPhone:styles.secondaryPhone}><Icon name="phone" size={18}/><span><strong>{p.number}</strong><small>{phoneLabel(p,locale)}</small></span><Icon name="arrow-right" size={17}/></a></li>)}</ul>
        <button type="button" className={styles.copy} onClick={copy}><Icon name="book-open" size={16}/>{locale==="vi"?"Sao chép thông tin":"Auswahl kopieren"}</button><p role="status" className={styles.copyStatus}>{copyStatus}</p>
        <div className={styles.hours}><Icon name="clock" size={17}/><div><strong>{s.openingHours}</strong><p>{pick(restaurant.openingHours.text,locale)}</p></div></div>
      </div>
    </aside>
  </div>;
}

function Calendar({month,setMonth,today,value,onPick,s,locale}:{month:Date;setMonth:(d:Date)=>void;today:Date;value:Date|null;onPick:(d:Date)=>void;s:ReservationStrings;locale:Locale}) {
  const year=month.getFullYear(),m=month.getMonth();
  const lead=(new Date(year,m,1).getDay()+6)%7;
  const count=new Date(year,m+1,0).getDate();
  return <div data-lich className={styles.calendar}><div className={styles.month}><button type="button" aria-label={s.prevMonth} disabled={month<=new Date(today.getFullYear(),today.getMonth(),1)} onClick={()=>setMonth(new Date(year,m-1,1))}><Icon name="chevron-left" size={18}/></button><strong>{s.months[m]} {year}</strong><button type="button" aria-label={s.nextMonth} onClick={()=>setMonth(new Date(year,m+1,1))}><Icon name="chevron-right" size={18}/></button></div><div className={styles.weekdays}>{s.weekdays.map(day=><span key={day}>{day}</span>)}</div><div className={styles.days}>{Array.from({length:42},(_,index)=>{const day=index-lead+1;if(day<1||day>count)return <span key={index} aria-hidden="true"/>;const d=new Date(year,m,day),selected=value?.getTime()===d.getTime();return <button key={index} type="button" aria-label={d.toLocaleDateString(locale==="vi"?"vi-VN":"de-DE")} disabled={d<today} aria-pressed={selected} onClick={()=>onPick(d)}>{day}</button>;})}</div></div>;
}
