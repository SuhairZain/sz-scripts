import { sum } from "../sum";

describe("GIVEN sum", () => {
  describe("WHEN given 1 and 1", () => {
    it("SHOULD be 2", () => {
      expect(sum(1, 1)).toBe(2);
    });
  });
});
