"use client";

import { Rate } from "@/payload-types";
import { updateRateGlobal } from "@/service/actions";
import { SaveButton, useForm } from "@payloadcms/ui";
import { useCallback } from "react";

export const BtnChangeRate = () => {
  const { dispatchFields, getDataByPath } = useForm();
  const handleChangeRate = useCallback(async (e: React.MouseEvent<Element>) => {
    e.preventDefault();
    const ratesData = getDataByPath("rates");
    if (!ratesData) return;
    const result = await updateRateGlobal({
      rates: ratesData as Rate["rates"],
    });
    if (!result) return;
    result.map((item, idx) => {
      dispatchFields({
        path: `rates.${idx}.rate`,
        type: "UPDATE",
        value: item.rate,
      });
    });
  }, []);
  return (
    <>
      <button onClick={handleChangeRate}>Change Rate</button>
      <SaveButton />
    </>
  );
};
