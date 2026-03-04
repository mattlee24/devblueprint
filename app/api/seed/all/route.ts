import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DUMMY_CLIENTS = [
  { name: "Acme Corp", company: "Acme Corporation", email: "projects@acmecorp.com", phone: "+44 20 7946 0958", website: "https://acmecorp.example.com", address: "123 Business Park, London, UK", notes: "Enterprise client.", status: "active" as const, hourly_rate: 95, currency: "GBP", avatar_colour: "#3b82f6" },
  { name: "Sarah Chen", company: "Chen Design Studio", email: "sarah@chendesign.studio", phone: "+44 7700 900123", website: "https://chendesign.studio", address: "45 Creative Lane, Manchester", notes: "Brand refresh project.", status: "active" as const, hourly_rate: 75, currency: "GBP", avatar_colour: "#ec4899" },
  { name: "Marcus Webb", company: "Webb & Partners", email: "marcus@webbpartners.co.uk", phone: "+44 161 555 0123", website: null, address: null, notes: "Legal firm.", status: "active" as const, hourly_rate: 110, currency: "GBP", avatar_colour: "#10b981" },
  { name: "Green Leaf Organics", company: "Green Leaf Organics Ltd", email: "hello@greenleaforganics.co.uk", phone: "+44 117 496 0123", website: "https://greenleaforganics.co.uk", address: "Unit 4, Farm Road, Bristol", notes: "E-commerce.", status: "active" as const, hourly_rate: 65, currency: "GBP", avatar_colour: "#22c55e" },
  { name: "Retro Games Co", company: "Retro Games Co", email: "dev@retrogames.co", phone: null, website: "https://retrogames.co", address: null, notes: "Indie game studio.", status: "inactive" as const, hourly_rate: 70, currency: "GBP", avatar_colour: "#f59e0b" },
];

const MINI_BLUEPRINT = {
  technicalRequirements: [{ text: "Modern stack (Next.js, React)" }, { text: "Hosting and CI/CD" }],
  feasibility: { technicalComplexity: 5, resourceRequirements: 4, timeToMarket: 6, scalabilityPotential: 7, overallVerdict: "medium" as const, summary: "Straightforward project with clear scope." },
  coreFeatures: [{ name: "Core feature set", type: "core" as const, effort: "medium" }],
  suggestedImprovements: ["Add analytics", "Consider A/B testing"],
  riskFactors: [{ level: "low" as const, description: "Standard delivery risk." }],
  scores: { clarityOfScope: 7, technicalFeasibility: 8, featureCompleteness: 6, riskProfile: 7 },
  overallScore: 7.2,
  summary: "Well-scoped project with good feasibility.",
};

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "You must be logged in to seed data." }, { status: 401 });
  }

  const uid = user.id;

  // 1) Get or create clients
  let { data: existingClients } = await supabase.from("clients").select("id").eq("user_id", uid);
  let clientIds: string[] = (existingClients ?? []).map((c) => c.id);

  if (clientIds.length < 3) {
    const inserts = DUMMY_CLIENTS.map((c) => ({ ...c, user_id: uid }));
    const { data: newClients, error: ec } = await supabase.from("clients").insert(inserts).select("id");
    if (ec) return NextResponse.json({ error: ec.message }, { status: 500 });
    clientIds = (newClients ?? []).map((c) => c.id);
  }

  const [client1, client2, client3] = clientIds;

  // 2) Projects
  const projectsData = [
    { user_id: uid, client_id: client1, title: "Acme Corp – Marketing site refresh", description: "Full refresh of the main marketing site: new design system, responsive layout, and CMS-driven content.", type: "website", status: "active" as const, stack: ["Next.js", "Bricks Builder"], blueprint: MINI_BLUEPRINT, overall_score: 7.2 },
    { user_id: uid, client_id: client2, title: "Chen Design Studio – Portfolio & CMS", description: "New portfolio site with project case studies and a simple CMS for the team.", type: "website", status: "active" as const, stack: ["Next.js", "React"], blueprint: MINI_BLUEPRINT, overall_score: 7.5 },
    { user_id: uid, client_id: client3, title: "Webb & Partners – Firm website", description: "Professional site for the law firm: practice areas, team profiles, news and contact.", type: "website", status: "active" as const, stack: ["Next.js (Custom)"], blueprint: MINI_BLUEPRINT, overall_score: 6.8 },
    { user_id: uid, client_id: client1, title: "Acme – Internal dashboard", description: "Internal reporting and dashboard for Acme operations team.", type: "web_application", status: "on_hold" as const, stack: ["Next.js", "React"], blueprint: MINI_BLUEPRINT, overall_score: 6.0 },
    { user_id: uid, client_id: null, title: "Side project – CLI tool", description: "Personal CLI for local dev workflows.", type: "cli", status: "active" as const, stack: ["Node.js"], blueprint: MINI_BLUEPRINT, overall_score: 8.0 },
  ];

  const { data: projects, error: ep } = await supabase.from("projects").insert(projectsData).select("id,client_id");
  if (ep) return NextResponse.json({ error: ep.message }, { status: 500 });
  const projectList = projects ?? [];
  const projectIds = projectList.map((p) => p.id);

  // 3) Tasks per project
  const taskTemplates = [
    { title: "Discovery & requirements", status: "done" as const, priority: "p1" as const, category: "dev" as const, effort: "medium" as const, position: 0 },
    { title: "Design system", status: "done" as const, priority: "p1" as const, category: "design" as const, effort: "high" as const, position: 1 },
    { title: "Homepage build", status: "in_progress" as const, priority: "p1" as const, category: "dev" as const, effort: "high" as const, position: 2 },
    { title: "CMS integration", status: "todo" as const, priority: "p2" as const, category: "dev" as const, effort: "medium" as const, position: 3 },
    { title: "Contact form & SEO", status: "backlog" as const, priority: "p2" as const, category: "seo" as const, effort: "low" as const, position: 4 },
    { title: "Testing & launch", status: "backlog" as const, priority: "p1" as const, category: "testing" as const, effort: "medium" as const, position: 5 },
  ];

  for (let i = 0; i < projectList.length; i++) {
    const projectId = projectList[i].id;
    const tasksToInsert = taskTemplates.slice(0, 4 + (i % 3)).map((t, pos) => ({
      project_id: projectId,
      user_id: uid,
      title: t.title,
      status: t.status,
      priority: t.priority,
      category: t.category,
      effort: t.effort,
      position: pos,
    }));
    await supabase.from("tasks").insert(tasksToInsert);
  }

  // 4) Time logs (spread over projects/clients, some billable)
  const baseDate = new Date();
  const timeLogsData: Array<{ user_id: string; client_id: string | null; project_id: string; description: string; hours: number; billable: boolean; hourly_rate: number | null; currency: string; logged_date: string }> = [];
  const rates: Record<number, number> = { 0: 95, 1: 75, 2: 110, 3: 65 };

  for (let p = 0; p < Math.min(3, projectList.length); p++) {
    const proj = projectList[p];
    const clientId = proj.client_id ?? client1;
    const rate = rates[p] ?? 80;
    for (let d = 0; d < 10; d++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().slice(0, 10);
      timeLogsData.push({
        user_id: uid,
        client_id: clientId,
        project_id: proj.id,
        description: `Development work – ${proj.id === projectList[0].id ? "marketing site" : "project tasks"}`,
        hours: 2 + (d % 4),
        billable: d % 3 !== 1,
        hourly_rate: rate,
        currency: "GBP",
        logged_date: dateStr,
      });
      if (d % 2 === 0) {
        timeLogsData.push({
          user_id: uid,
          client_id: clientId,
          project_id: proj.id,
          description: "Meetings and review",
          hours: 1,
          billable: false,
          hourly_rate: null,
          currency: "GBP",
          logged_date: dateStr,
        });
      }
    }
  }

  const { data: timeLogsInserted, error: et } = await supabase.from("time_logs").insert(timeLogsData).select("id,client_id,hours,billable,hourly_rate");
  if (et) return NextResponse.json({ error: et.message }, { status: 500 });
  const timeLogs = timeLogsInserted ?? [];

  // 5) Invoices (draft, sent, paid)
  const invoicesData = [
    { user_id: uid, client_id: client1, invoice_number: "INV-2024-001", status: "paid" as const, issue_date: "2024-01-15", due_date: "2024-02-15", subtotal: 0, tax_rate: 20, tax_amount: 0, total: 0, currency: "GBP" },
    { user_id: uid, client_id: client2, invoice_number: "INV-2024-002", status: "sent" as const, issue_date: "2024-02-01", due_date: "2024-03-01", subtotal: 0, tax_rate: 20, tax_amount: 0, total: 0, currency: "GBP" },
    { user_id: uid, client_id: client1, invoice_number: "INV-2024-003", status: "draft" as const, issue_date: "2024-02-20", due_date: "2024-03-22", subtotal: 0, tax_rate: 20, tax_amount: 0, total: 0, currency: "GBP" },
  ];

  const { data: invoices, error: ei } = await supabase.from("invoices").insert(invoicesData).select("id,client_id");
  if (ei) return NextResponse.json({ error: ei.message }, { status: 500 });
  const invoiceList = invoices ?? [];

  // 6) Invoice items and link time logs
  const itemDescriptions = ["Design and discovery", "Front-end development", "CMS setup and content migration", "Testing and bug fixes", "Project management"];
  for (let inv = 0; inv < invoiceList.length; inv++) {
    const invId = invoiceList[inv].id;
    const unitPrice = inv === 0 ? 95 : inv === 1 ? 75 : 95;
    let subtotal = 0;
    const items = [
      { description: itemDescriptions[0], qty: 8, price: unitPrice },
      { description: itemDescriptions[1], qty: 24, price: unitPrice },
      { description: itemDescriptions[2], qty: 12, price: unitPrice },
    ].slice(0, 2 + (inv % 2));
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await supabase.from("invoice_items").insert({
        invoice_id: invId,
        description: item.description,
        quantity: item.qty,
        unit_price: item.price,
        position: i,
      });
      subtotal += item.qty * item.price;
    }
    const taxRate = 20;
    const taxAmount = (subtotal * taxRate) / 100;
    await supabase.from("invoices").update({ subtotal, tax_amount: taxAmount, total: subtotal + taxAmount }).eq("id", invId);
  }

  // 7) Optionally link some time logs to first invoice (so "add from time logs" still has uninvoiced ones)
  const firstInvoiceId = invoiceList[0]?.id;
  if (firstInvoiceId) {
    const toLink = timeLogs.filter((t) => t.billable && t.client_id === client1).slice(0, 5);
    for (const log of toLink) {
      await supabase.from("time_logs").update({ invoice_id: firstInvoiceId }).eq("id", log.id);
    }
  }

  return NextResponse.json({
    success: true,
    clients: clientIds.length,
    projects: projectList.length,
    timeLogs: timeLogs.length,
    invoices: invoiceList.length,
  });
}
