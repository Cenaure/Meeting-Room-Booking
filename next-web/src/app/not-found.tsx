"use client"

import Image from "next/image";
import Button from "@/components/ui/_shared/button/button";

export default function NotFound() {
  return (
    <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
        <div>
          <div className="w-60 aspect-square relative">
            <Image src={"/not-found-fox.svg"} alt={"Not found fox"} fill objectFit="contain" />
          </div>
          <div className="text-lavender-400 text-4xl font-bold text-center">404</div>
        </div>


        <h1>Сторінку не знайдено</h1>

        <Button size="lg" onClick={() => window.location.href = "/"}>
          Повернутися на головну
        </Button>
    </div>
  )
}