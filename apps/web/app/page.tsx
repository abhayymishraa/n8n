import { prisma } from "@repo/database";

export default async function IndexPage() {
  const users = await prisma.user.findMany();

  return (
    <div>
      <h1>Hello World</h1>
      <h1 className="text-3xl text-rose-500 font-bold underline">Hello world!</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
