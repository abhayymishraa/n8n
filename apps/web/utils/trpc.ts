import { type CreateTRPCReact, createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { type AppRouter } from "../server/trpc/root";

type TRPC = CreateTRPCReact<AppRouter, unknown>;

//
export const trpc: TRPC = createTRPCReact<AppRouter>();


export function getBaseUrl(){
    return "http://localhost:3000"
}


export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url:"http://localhost:3000/api/trpc"
        })
    ]
})