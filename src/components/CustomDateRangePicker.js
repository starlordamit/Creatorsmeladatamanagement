// components/CustomDateRangePicker.jsx

import React from "react";
import { Box, useColorMode, useColorModeValue, Button } from "@chakra-ui/react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css"; // Main style file
import "react-date-range/dist/theme/default.css"; // Theme CSS file
import { FiCalendar } from "react-icons/fi";

const CustomDateRangePicker = ({ dateRange, setDateRange }) => {
  const { colorMode } = useColorMode();

  // Define theme colors based on Chakra UI's color mode
  const bg = useColorModeValue("white", "gray.700");
  const text = useColorModeValue("black", "white");
  const selectionColor = useColorModeValue("#3182CE", "#63B3ED"); // Chakra's blue shades

  // Custom styles for react-date-range
  const customStyles = {
    calendar: {
      background: bg,
      color: text,
    },
    dayContent: {
      color: text,
    },
    selected: {
      background: selectionColor,
      color: "white",
    },
    today: {
      border: `1px solid ${selectionColor}`,
    },
    input: {
      border: "none",
      background: "transparent",
      color: text,
    },
    monthAndYear: {
      color: text,
    },
    day: {
      color: text,
    },
    weekday: {
      color: text,
    },
  };

  return (
    <Box>
      <DateRange
        editableDateInputs={true}
        onChange={(item) =>
          setDateRange([item.selection.startDate, item.selection.endDate])
        }
        moveRangeOnFirstSelection={false}
        ranges={[
          {
            startDate: dateRange[0],
            endDate: dateRange[1],
            key: "selection",
          },
        ]}
        maxDate={addDays(new Date(), 365)}
        minDate={addDays(new Date(), -365)}
        rangeColors={[selectionColor]}
        className="custom-date-range"
        styles={customStyles}
      />
    </Box>
  );
};

export default CustomDateRangePicker;
