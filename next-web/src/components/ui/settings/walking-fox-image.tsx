import Image from "next/image";

export default function WalkingFoxImage() {
  return (
    <div
      className="pointer-events-none h-30 w-60 relative -scale-x-100 opacity-80 dark:mix-blend-screen"
    >
      <Image
        src="/walking-fox.svg"
        alt="Walking fox"
        fill
        objectFit="contain"
      />
    </div>
  );
}