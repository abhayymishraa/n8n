"use client";

import { useState } from "react";
import { trpc } from "../../utils/trpc";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const signupmutate = trpc.auth.signup.useMutation();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formadata = new FormData(e.currentTarget);
    const emai = formadata.get("email");
    const pass = formadata.get("password");
    console.log(emai, pass);
    try {
      const data = await signupmutate.mutateAsync({
        email: emai as string,
        password: pass as string,
      });
      console.log(data);
      router.push("/login");
    } catch (e) {
      throw new Error("You are doing somehting shady");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          className="border-2 border-black"
          required
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          className="border-2 border-black"
          required
          placeholder="Password (min. 8 characters)"
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          className="border-2 border-black"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
