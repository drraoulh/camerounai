import { readFileSync } from "fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const { fetchDestinations } = await import("../src/lib/tourism-db.ts");
const d = await fetchDestinations();
console.log("count", d.length, "source", d[0]?.source);
console.log(
  JSON.stringify(
    d.slice(0, 3).map((x) => ({
      id: x.id,
      name: x.name,
      city: x.city,
      lat: x.lat,
      lng: x.lng,
    })),
    null,
    2,
  ),
);
