import dotenv from "dotenv";
dotenv.config();

import { faker } from "@faker-js/faker";
import { db, type EventInsertType } from "~/db/db";
import { eventsTable } from "~/db/schema";
import { eventTypes } from "@codaco/analytics";

let installationIds: string[] = [];
for (let i = 0; i < 20; i++) {
  installationIds.push(faker.string.uuid());
}

async function seedEvents() {
  console.info("Starting to seed events");

  try {
    for (let i = 0; i < 100; i++) {
      const type = faker.helpers.arrayElement(eventTypes);
      const installationId = faker.helpers.arrayElement(installationIds);
      const timestamp = faker.date.recent();
      const metadata = {
        details: faker.lorem.sentence(),
        path: faker.lorem.sentence(),
      };
      const countryISOCode = faker.location.countryCode();
      const message = faker.lorem.sentence();
      const name = faker.lorem.sentence();
      const stack = faker.lorem.sentence();

      const event: EventInsertType = {
        type,
        metadata,
        timestamp,
        installationId,
        countryISOCode,
        message,
        name,
        stack,
      };

      await db.insert(eventsTable).values(event).returning();
    }
  } catch (error) {
    console.error("Error seeding events", error);
  }

  process.exit();
}

(async () => {
  await seedEvents();
})();