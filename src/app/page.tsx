import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  console.log(cookieStore);
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  redirect("/admin/notice");
}
