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

	// ✅ se o value mudar "por fora", atualiza o estado interno
	useEffect(() => {
		if (!value) return;
		const [y, m] = value.split("-");
		setYear(Number(y));
		setMonth(Number(m) - 1);
	}, [value]);

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

	// ✅ só dispara onChange se o valor final realmente mudou
	useEffect(() => {
		const formattedMonth = String(month + 1).padStart(2, "0");
		const nextValue = `${year}-${formattedMonth}`;
		if (nextValue !== value) onChange(nextValue);
	}, [month, year, value, onChange]);

	return (
		<div className="month-filter">
			<button type="button" onClick={prevMonth}>
				&lt;
			</button>

			<span>
				{MONTHS[month]} <small>{year}</small>
			</span>

			<button type="button" onClick={nextMonth}>
				&gt;
			</button>
		</div>
	);
}
