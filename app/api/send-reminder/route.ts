import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error: "RESEND_API_KEY is missing in .env.local",
        },
        {
          status: 500,
        }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const {
      email,
      clientName,
      amount,
      dueDate,
      tone,
      currency,
    } = await req.json();

    const symbol =
      currency === "PKR" ? "Rs " : "$";

    let message = "";

    switch (tone) {
      case "formal":
        message = `Dear ${clientName},

This is a reminder that your invoice of ${symbol}${amount} is due on ${dueDate}.

Please make the payment at your earliest convenience.

Thank you.`;
        break;

      case "firm":
        message = `Dear ${clientName},

Your invoice of ${symbol}${amount} was due on ${dueDate}.

Please complete payment immediately.

Thank you.`;
        break;

      default:
        message = `Hi ${clientName},

Just a friendly reminder 😊

Your invoice of ${symbol}${amount} is due on ${dueDate}.

Thanks!`;
    }

    const { data, error } = await resend.emails.send({
      from: "InvoiceNudge <onboarding@resend.dev>",
      to: email,
      subject: "Invoice Reminder",
      text: message,
    });

    if (error) {
      return NextResponse.json(
        {
          error,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: String(err),
      },
      {
        status: 500,
      }
    );
  }
}