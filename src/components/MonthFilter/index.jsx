import { useState, useEffect } from "react";
import "./index.css";

const MONTHS = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

export default function MonthFilter({ value, onChange }) {
	const today = new Date();

	const [month, setMonth] = useState(
		value ? Number(value.split("-")[1]) - 1 : today.getMonth(),
	);
	const [year, setYear] = useState(
		value ? Number(value.split("-")[0]) : today.getFullYear(),
	);

	function prevMonth() {
		setMonth((prev) => {
			if (prev === 0) {
				setYear((y) => y - 1);
				return 11;
			}
			return prev - 1;
		});
	}

	function nextMonth() {
		setMonth((prev) => {
			if (prev === 11) {
				setYear((y) => y + 1);
				return 0;
			}
			return prev + 1;
		});
	}

	useEffect(() => {
		const formattedMonth = String(month + 1).padStart(2, "0");
		onChange(`${year}-${formattedMonth}`);
	}, [month, year]);

	return (
		<div className="month-filter">
			<button onClick={prevMonth}>&lt;</button>

			<span>
				{MONTHS[month]} <small>{year}</small>
			</span>

			<button onClick={nextMonth}>&gt;</button>
		</div>
	);
}
