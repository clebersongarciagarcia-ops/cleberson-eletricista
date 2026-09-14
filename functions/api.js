const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*"}});
const bad=(m,s=400)=>json({error:m},s);
async function body(req){try{return await req.json()}catch{return {}}}
export async function onRequest(context){
  const {request,env}=context;
  if(!env.DB)return bad("D1 não está conectado. Crie o banco e adicione o binding DB ao projeto.",503);
  const url=new URL(request.url), path=url.pathname.replace(/^\/api/,"")||"/";
  try{
    if(request.method==="GET"&&path==="/bookings"){
      const {results}=await env.DB.prepare("SELECT * FROM bookings ORDER BY date ASC,time ASC").all(); return json(results);
    }
    if(request.method==="POST"&&path==="/bookings"){
      const b=await body(request); const req=["service","date","time","name","phone"];
      if(req.some(k=>!String(b[k]||"").trim()))return bad("Campos obrigatórios ausentes.");
      const now=new Date().toISOString();
      const r=await env.DB.prepare(`INSERT INTO bookings(service,date,time,name,phone,address,details,value,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
       .bind(b.service,b.date,b.time,b.name,b.phone,b.address||"",b.details||"",b.value||"0,00","Pendente",now,now).run();
      const x=await env.DB.prepare("SELECT * FROM bookings WHERE id=?").bind(r.meta.last_row_id).first(); return json({booking:x},201);
    }
    const match=path.match(/^\/bookings\/(\d+)$/);
    if(match&&request.method==="PATCH"){const b=await body(request);if(!["Pendente","Confirmado","Concluído","Cancelado"].includes(b.status))return bad("Status inválido.");await env.DB.prepare("UPDATE bookings SET status=?,updated_at=? WHERE id=?").bind(b.status,new Date().toISOString(),match[1]).run();return json(await env.DB.prepare("SELECT * FROM bookings WHERE id=?").bind(match[1]).first())}
    if(match&&request.method==="DELETE"){await env.DB.prepare("DELETE FROM bookings WHERE id=?").bind(match[1]).run();return json({ok:true})}
    if(request.method==="GET"&&path==="/clients"){
      const q=url.searchParams.get("q")||"";
      const {results}=await env.DB.prepare(`SELECT name,phone,MAX(address) address,COUNT(*) total_bookings FROM bookings WHERE name LIKE ? OR phone LIKE ? GROUP BY name,phone ORDER BY name`).bind("%"+q+"%","%"+q+"%").all();return json(results);
    }
    return bad("Rota não encontrada.",404);
  }catch(e){return bad("Erro interno: "+e.message,500)}
  }
