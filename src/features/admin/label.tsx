"use client";
import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { useResource } from "@/features/use-resource";
import { type OrderDetail, money } from "@shared/contracts";
import { Message, button, Back } from "@/features/ui";
export function ShippingLabel({ id }: { id: string }) {
  const { data, error } = useResource<OrderDetail>(
    `admin/orders/${id}/label`,
    "admin",
  );
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (data && ref.current)
      JsBarcode(ref.current, data.order.tracking_code, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 12,
      });
  }, [data]);
  return (
    <>
      <div className="no-print">
        <Back href={`/admin/orders/${id}`}>Order details</Back>
        <Message error>{error}</Message>
        <button
          className={`${button} mb-6 ml-5`}
          disabled={!data}
          onClick={() => window.print()}
        >
          Print 4 × 6 label
        </button>
      </div>
      {data && (
        <article className="shipping-label border-2 border-black bg-white p-4 text-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/fresava-shipping-logo.png"
            alt="FRESAVA"
            className="mx-auto h-12 w-auto object-contain"
          />
          <p className="my-2 text-center text-xs">
            SHIPPING LABEL · {data.order.order_number}
          </p>
          <div className="border-y py-3 text-xs">
            <b>FROM: FRESAVA</b>
            <p>Block-F, Sector-2, Avenue-9, House-6, Aftabnagar, Dhaka 1212</p>
          </div>
          <div className="border-b py-3 text-sm">
            <b>TO: {data.order.customer_name}</b>
            <p>{data.order.phone}</p>
            <p>
              {data.order.address}, {data.order.city}
            </p>
          </div>
          <table className="my-3 w-full text-xs">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((i) => (
                <tr key={i.id}>
                  <td className="py-1">
                    {i.sku} · {i.product_name}
                  </td>
                  <td className="text-center">{i.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <svg ref={ref} className="mx-auto w-full" />
          <p className="mt-2 text-center text-sm font-bold">
            CASH ON DELIVERY · {money(data.order.total)}
          </p>
          <p className="mt-2 text-center text-xs">
            Net product weight:{" "}
            {data.items.reduce(
              (s, i) => s + i.jars * i.jar_weight_g * i.quantity,
              0,
            )}{" "}
            g
          </p>
          <p className="mt-2 text-center text-xs">
            Payment: {data.order.payment_status}
          </p>
        </article>
      )}
      <style jsx global>{`
        .shipping-label {
          width: 4in;
          min-height: 6in;
        }
        @media print {
          @page {
            size: 4in 6in;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          .shipping-label,
          .shipping-label * {
            visibility: visible;
          }
          .shipping-label {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
