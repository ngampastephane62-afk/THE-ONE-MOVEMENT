import assert from "node:assert/strict";
import test from "node:test";
import { getProgrammeServiceOffer, getProgrammeServiceOffers } from "@workspace/shared";

test("the Summit speaker fee is USD 10,000 and remains a service, not an annual sponsor tier", () => {
  const offer = getProgrammeServiceOffer("summit", "speaker");
  assert.equal(offer?.priceUsd, 10000);
  assert.equal(offer?.programme, "summit");
  assert.equal(offer?.role, "speaker");
});

test("no other role or programme receives an invented fixed fee", () => {
  const programmes = ["summit", "fashion-week", "fashion-night", "awards", "diplomatic-gala", "investment-forum"];
  const priced = programmes.flatMap(getProgrammeServiceOffers).filter((offer) => offer.priceUsd !== null);
  assert.equal(priced.length, 1);
  assert.equal(priced[0]?.programme, "summit");
  assert.equal(priced[0]?.role, "speaker");
});

test("both fashion programmes offer distinct creative-professional paths", () => {
  for (const programme of ["fashion-week", "fashion-night"]) {
    for (const role of ["designer", "model", "hair-stylist", "makeup-artist"]) {
      const offer = getProgrammeServiceOffer(programme, role);
      assert.equal(offer?.role, role);
      assert.equal(offer?.programme, programme);
      assert.equal(offer?.priceUsd, null);
    }
  }
});

test("all six programmes have their own speaker, exhibitor, brand and media requests", () => {
  for (const programme of ["summit", "fashion-week", "fashion-night", "awards", "diplomatic-gala", "investment-forum"]) {
    for (const role of ["speaker", "exhibitor", "brand", "media"]) {
      assert.equal(getProgrammeServiceOffer(programme, role)?.programme, programme);
    }
  }
});

test("invalid query parameters cannot select fabricated programme services", () => {
  assert.deepEqual(getProgrammeServiceOffers("not-a-programme"), []);
  assert.equal(getProgrammeServiceOffer("summit", "not-a-role"), undefined);
  assert.equal(getProgrammeServiceOffer("summit", "makeup-artist"), undefined);
});
