import { describe, expect, test } from "bun:test";
import { WEBINAR_PAYMENT_URL, WEBINAR_SEAT_PRICE_INR } from "./webinar";

describe("webinar seat offer", () => {
  test("a seat costs 49 rupees", () => {
    expect(WEBINAR_SEAT_PRICE_INR).toBe(49);
  });

  test("payment uses the supplied Razorpay link", () => {
    expect(WEBINAR_PAYMENT_URL).toBe("https://rzp.io/rzp/8jxhayd");
  });
});