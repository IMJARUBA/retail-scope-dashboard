import { redirect } from "next/navigation";

export default function Home() {
  // Esto enviará al usuario directamente a tu dashboard principal
  redirect("/executive"); 
}