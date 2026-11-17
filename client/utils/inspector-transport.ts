import { connectDevframe, type DevframeRpcClient } from "devframe/client";
import type { DevtoolsData } from "../types/devtools";
import { VARIANTS_SNAPSHOT_RPC } from "../../src/runtime/utils/devtools-protocol";

export interface InspectorTransport {
  label: string;
  read(): Promise<DevtoolsData>;
  close(): void;
}

export async function createInspectorTransport(base: URL): Promise<InspectorTransport> {
  const explicit = new URLSearchParams(window.location.search).get("transport");
  if (explicit !== "legacy") {
    const descriptor = await fetch(new URL("__connection.json", base));
    if (descriptor.ok && descriptor.headers.get("content-type")?.includes("json")) {
      const connectionMeta = await descriptor.json();
      const client: DevframeRpcClient = await connectDevframe({
        connectionMeta,
        baseURL: base.href,
        callTimeout: 8000,
      });
      return {
        label: connectionMeta.backend === "static" ? "Offline snapshot" : "Live DevFrame",
        read: () => client.call(VARIANTS_SNAPSHOT_RPC) as Promise<DevtoolsData>,
        close: () => client.close?.(),
      };
    }
    if (explicit === "devframe") throw new Error("DevFrame connection descriptor is unavailable.");
    if (descriptor.status !== 404 && !descriptor.ok)
      throw new Error(`Inspector connection request failed with ${descriptor.status}.`);
  }
  return {
    label: "Legacy JSON",
    async read() {
      const response = await fetch(new URL("data.json", base));
      if (!response.ok) throw new Error(`DevTools data request failed with ${response.status}.`);
      return response.json();
    },
    close() {},
  };
}
