import Pusher from "pusher";
import PusherClient from "pusher-js";

let pusherServerInstance: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherServerInstance) {
    const PusherCtor = (Pusher as any).default || Pusher;
    pusherServerInstance = new PusherCtor({
      appId: process.env.PUSHER_APP_ID || "dummy-app-id",
      key: process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy-key",
      secret: process.env.PUSHER_SECRET || "dummy-secret",
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
      useTLS: true,
    });
  }
  return pusherServerInstance!;
}

// Client instance lazily created in browser context
export const pusherClient = typeof window !== "undefined"
  ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy-key", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    })
  : (null as unknown as PusherClient);

export async function triggerPusher(channel: string, event: string, data: any) {
  try {
    if (
      process.env.PUSHER_APP_ID && 
      process.env.PUSHER_SECRET &&
      process.env.PUSHER_APP_ID !== "dummy-app-id"
    ) {
      const server = getPusherServer();
      await server.trigger(channel, event, data);
    }
  } catch (error) {
    console.warn(`Pusher trigger warning [${channel}/${event}]:`, error);
  }
}

