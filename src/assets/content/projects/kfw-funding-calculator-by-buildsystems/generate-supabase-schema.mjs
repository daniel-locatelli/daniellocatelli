// Generates public/assets/content/projects/kfw-funding-calculator-by-buildsystems/supabase-schema.svg
// Run: node src/assets/content/projects/kfw-funding-calculator-by-buildsystems/generate-supabase-schema.mjs
// Supabase schema of the second version: users, three project tables, their join tables, and the Einzelmassnahmen items/values.
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, entity, arrow, elbow, note, write, C } from "../../svg-kit.mjs";

const ID = "kfw-schema";
const W = 1680;
const H = 720;
const b = [];
const TW = 290;
const colX = [80, 490, 900, 1320]; // neubau, sanierung (+ users, join table), einzelmassnahmen, items/values

// cardinality mark
const card = (x, y, t, anchor = "middle") => note(x, y, t, { anchor, size: 13, color: C.dim });

// common fields of a project table
const projectFields = (extra) => [
  ["bigint", "id", "pk"],
  ["text", "title"],
  ["uuid", "created_by", "fk"],
  ["timestamp", "created_at"],
  ["uuid", "owned_by", "fk"],
  ["uuid", "last_edited_by", "fk"],
  ["timestamp", "last_edited_at"],
  ...extra,
];

// Row 1: users
const auth = { x: colX[1], y: 60 };
const authE = entity(auth.x, auth.y, TW, "auth_users", [["uuid", "id", "pk"]], { accent: true });
const authCx = auth.x + TW / 2;
const authBottom = auth.y + authE.h;

// Row 2: the three project tables
const py = 230;
const projects = [
  { x: colX[0], name: "neubau_projects", fields: projectFields([["text", "other_project_values"]]) },
  { x: colX[1], name: "sanierung_projects", fields: projectFields([["text", "other_project_values"]]) },
  { x: colX[2], name: "einzelmassnahmen_projects", fields: projectFields([["float", "vollkosten"], ["float", "bafa_foerderung"]]) },
];
for (const p of projects) {
  const e = entity(p.x, py, TW, p.name, p.fields);
  p.svg = e.svg;
  p.h = e.h;
  p.cx = p.x + TW / 2;
  p.bottom = py + e.h;
}

// Row 3: the user <-> project join table (one per calculator, identical shape)
const jx = colX[1];
const jy = 560;
const junction = entity(jx, jy, TW, "user_*_projects", [["bigint", "id", "pk"], ["uuid", "user_id", "fk"], ["bigint", "project_id", "fk"]], {
  sub: "one table per calculator (×3)",
});
const jcx = jx + TW / 2;

// Right column: Einzelmassnahmen items and values
const ix = colX[3];
const iy = 230;
const items = entity(ix, iy, TW, "einzelmassnahmen_items", [["bigint", "id", "pk"], ["bigint", "project_id", "fk"], ["text", "title"], ["int", "position"]]);
const vy = 430;
const values = entity(ix, vy, TW, "einzelmassnahmen_values", [
  ["bigint", "id", "pk"],
  ["bigint", "item_id", "fk"],
  ["bigint", "project_id", "fk"],
  ["text", "title"],
  ["float", "value"],
  ["text", "unit"],
  ["int", "position"],
]);
const icx = ix + TW / 2;

// --- relationships (drawn before the boxes) ---
// users -> projects: one bus for the three user references every project table carries
const busY = 180;
b.push(elbow(ID, [[authCx, authBottom + 2], [authCx, busY], [projects[0].cx, busY], [projects[0].cx, py - 2]], "created_by · owned_by · last_edited_by", { labelAt: 1, labelDy: 0 }));
b.push(elbow(ID, [[authCx, authBottom + 2], [authCx, busY], [projects[2].cx, busY], [projects[2].cx, py - 2]]));
b.push(arrow(ID, authCx, authBottom + 2, authCx, py - 2));
b.push(card(authCx + 10, authBottom + 16, "1", "start"));
for (const p of projects) b.push(card(p.cx + 10, py - 8, "N", "start"));

// users -> join table: around the left margin
const loopX = 40;
b.push(elbow(ID, [[auth.x - 2, auth.y + 38], [loopX, auth.y + 38], [loopX, jy + 70], [jx - 2, jy + 70]], "has many", { labelAt: 2, labelDy: -10 }));
b.push(card(auth.x - 10, auth.y + 30, "1", "end"));
b.push(card(jx - 10, jy + 62, "N", "end"));

// projects -> join table
const jBusY = 520;
b.push(elbow(ID, [[projects[0].cx, projects[0].bottom + 2], [projects[0].cx, jBusY], [jcx - 40, jBusY], [jcx - 40, jy - 2]]));
b.push(arrow(ID, projects[1].cx, projects[1].bottom + 2, projects[1].cx, jy - 2));
b.push(elbow(ID, [[projects[2].cx, projects[2].bottom + 2], [projects[2].cx, jBusY], [jcx + 40, jBusY], [jcx + 40, jy - 2]]));
for (const p of projects) b.push(card(p.cx + 10, p.bottom + 16, "1", "start"));
for (const dx of [-40, 0, 40]) b.push(card(jcx + dx + 8, jy - 8, "N", "start"));

// einzelmassnahmen_projects -> items, -> values; items -> values
const ez = projects[2];
b.push(arrow(ID, ez.x + TW + 2, iy + 70, ix - 2, iy + 70, "contains"));
b.push(arrow(ID, ez.x + TW + 2, vy + 26, ix - 2, vy + 26, "contains"));
b.push(arrow(ID, icx, iy + items.h + 2, icx, vy - 2));
b.push(card(ez.x + TW + 8, iy + 62, "1", "start"));
b.push(card(ix - 8, iy + 62, "N", "end"));
b.push(card(ez.x + TW + 8, vy + 18, "1", "start"));
b.push(card(ix - 8, vy + 18, "N", "end"));
b.push(card(icx + 10, iy + items.h + 16, "1", "start"));
b.push(card(icx + 10, vy - 8, "N", "start"));

// --- boxes ---
b.push(authE.svg);
for (const p of projects) b.push(p.svg);
b.push(junction.svg);
b.push(items.svg);
b.push(values.svg);

// legend
b.push(note(colX[0], H - 24, "# primary key · → foreign key · 1 / N cardinality", { size: 13, color: C.dim }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title:
    "Supabase schema: auth_users at the top; below it the three project tables neubau_projects, sanierung_projects and einzelmassnahmen_projects, each with id, title, created_by, created_at, owned_by, last_edited_by, last_edited_at and project values, all referencing auth_users through created_by, owned_by and last_edited_by; a user_*_projects join table (one per calculator) linking users to their projects; and einzelmassnahmen_items and einzelmassnahmen_values hanging off einzelmassnahmen_projects.",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/projects/kfw-funding-calculator-by-buildsystems/supabase-schema.svg"), svg);
