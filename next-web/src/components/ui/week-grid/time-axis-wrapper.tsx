import {TimeAxisProps} from "@/components/ui/week-grid/time-axis";
import dynamic from "next/dynamic";

const TimeAxis = dynamic(
  () => import("@/components/ui/week-grid/time-axis"),
  {
    ssr: false,
    loading: () => <div/>,
  }
);

interface TimeAxisWrapperProps extends TimeAxisProps {
}

export default function TimeAxisWrapper({hours, hourHeight, headerHeight}: TimeAxisWrapperProps) {
  return <TimeAxis hours={hours} hourHeight={hourHeight} headerHeight={headerHeight}/>;
}