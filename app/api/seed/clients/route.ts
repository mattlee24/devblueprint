import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DUMMY_CLIENTS = [
  {
    name: "Acme Corp",
    company: "Acme Corporation",
    email: "projects@acmecorp.com",
    phone: "+44 20 7946 0958",
    website: "https://acmecorp.example.com",
    address: "123 Business Park, London, UK",
    notes: "Enterprise client. Prefers weekly check-ins.",
    status: "active" as const,
    hourly_rate: 95,
    currency: "GBP",
    avatar_colour: "#3b82f6",
  },
  {
    name: "Sarah Chen",
    company: "Chen Design Studio",
    email: "sarah@chendesign.studio",
    phone: "+44 7700 900123",
    website: "https://chendesign.studio",
    address: "45 Creative Lane, Manchester",
    notes: "Brand refresh and web redesign project.",
    status: "active" as const,
    hourly_rate: 75,
    currency: "GBP",
    avatar_colour: "#ec4899",
  },
  {
    name: "Marcus Webb",
    company: "Webb & Partners",
    email: "marcus@webbpartners.co.uk",
    phone: "+44 161 555 0123",
    website: null,
    address: null,
    notes: "Legal firm. New client as of Q1.",
    status: "active" as const,
    hourly_rate: 110,
    currency: "GBP",
    avatar_colour: "#10b981",
  },
  {
    name: "Green Leaf Organics",
    company: "Green Leaf Organics Ltd",
    email: "hello@greenleaforganics.co.uk",
    phone: "+44 117 496 0123",
    website: "https://greenleaforganics.co.uk",
    address: "Unit 4, Farm Road, Bristol",
    notes: "E-commerce and sustainability focus.",
    status: "active" as const,
    hourly_rate: 65,
    currency: "GBP",
    avatar_colour: "#22c55e",
  },
  {
    name: "Retro Games Co",
    company: "Retro Games Co",
    email: "dev@retrogames.co",
    phone: null,
    website: "https://retrogames.co",
    address: null,
    notes: "Indie game studio. Project on hold.",
    status: "inactive" as const,
    hourly_rate: 70,
    currency: "GBP",
    avatar_colour: "#f59e0b",
  },
];

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "You must be logged in to seed clients." },
      { status: 401 }
    );
  }

  const inserts = DUMMY_CLIENTS.map((c) => ({
    ...c,
    user_id: user.id,
  }));

  const { data, error } = await supabase
    .from("clients")
    .insert(inserts)
    .select("id,name");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    count: data?.length ?? 0,
    clients: data,
  });
}
