import { useMemo, useState } from "react";
import "./index.css";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { ChartBarIcon, ChartLineIcon, ChartPieIcon } from "@phosphor-icons/react";

const COLORS = [
	"#6DC956",
	"#ee5d4aff",
	"#4A9FE0",
	"#E0B84A",
	"#B06DE0",
	"#4AD9C7",
	"#E0794A",
	"#9AA5B1",
];

function isInFilteredMonth(dataString, mesFiltro) {
	if (!mesFiltro) return true;
	return dataString?.slice(0, 7) === mesFiltro;
}

function formatarValorBRL(valor) {
	return Number(valor || 0).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export default function CategoryChart({
	items,
	mesFiltro,
	getDateString,
	title,
	accentColor = "#6DC956",
	emptyMessage = "Sem dados neste mês.",
}) {
	const [chartType, setChartType] = useState("bar");

	const dados = useMemo(() => {
		const itensDoMes = items.filter((item) =>
			isInFilteredMonth(getDateString(item), mesFiltro),
		);

		const totaisPorCategoria = itensDoMes.reduce((acc, item) => {
			const categoria = item.categoria || "Sem categoria";
			acc[categoria] = (acc[categoria] || 0) + Number(item.valor || 0);
			return acc;
		}, {});

		return Object.entries(totaisPorCategoria)
			.map(([categoria, total]) => ({ categoria, total }))
			.sort((a, b) => b.total - a.total);
	}, [items, mesFiltro, getDateString]);

	return (
		<>
			<div className="catchart-head">
				<h3>{title}</h3>

				<div className="catchart-toggle">
					<button
						type="button"
						className={chartType === "bar" ? "active" : ""}
						onClick={() => setChartType("bar")}
						title="Barras"
					>
						<ChartBarIcon size={18} weight="bold" />
					</button>
					<button
						type="button"
						className={chartType === "pie" ? "active" : ""}
						onClick={() => setChartType("pie")}
						title="Pizza"
					>
						<ChartPieIcon size={18} weight="bold" />
					</button>
					<button
						type="button"
						className={chartType === "line" ? "active" : ""}
						onClick={() => setChartType("line")}
						title="Linhas"
					>
						<ChartLineIcon size={18} weight="bold" />
					</button>
				</div>
			</div>

			{dados.length === 0 ? (
				<p className="catchart-empty">{emptyMessage}</p>
			) : (
				<div className="catchart-chart">
					<ResponsiveContainer width="100%" height={300}>
						{chartType === "bar" ? (
							<BarChart data={dados}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="rgba(255,255,255,0.08)"
								/>
								<XAxis
									dataKey="categoria"
									stroke="rgba(255,255,255,0.6)"
									fontSize={12}
								/>
								<YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
								<Tooltip
									formatter={(value) => formatarValorBRL(value)}
									contentStyle={{
										background: "#1c1c22",
										border: "1px solid rgba(255,255,255,0.08)",
										borderRadius: 8,
									}}
								/>
								<Bar dataKey="total" radius={[6, 6, 0, 0]}>
									{dados.map((entry, index) => (
										<Cell
											key={entry.categoria}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Bar>
							</BarChart>
						) : chartType === "pie" ? (
							<PieChart>
								<Tooltip
									formatter={(value) => formatarValorBRL(value)}
									contentStyle={{
										background: "#1c1c22",
										border: "1px solid rgba(255,255,255,0.08)",
										borderRadius: 8,
									}}
								/>
								<Legend wrapperStyle={{ fontSize: 12 }} />
								<Pie
									data={dados}
									dataKey="total"
									nameKey="categoria"
									outerRadius={100}
									label={({ categoria }) => categoria}
								>
									{dados.map((entry, index) => (
										<Cell
											key={entry.categoria}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
							</PieChart>
						) : (
							<LineChart data={dados}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="rgba(255,255,255,0.08)"
								/>
								<XAxis
									dataKey="categoria"
									stroke="rgba(255,255,255,0.6)"
									fontSize={12}
								/>
								<YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
								<Tooltip
									formatter={(value) => formatarValorBRL(value)}
									contentStyle={{
										background: "#1c1c22",
										border: "1px solid rgba(255,255,255,0.08)",
										borderRadius: 8,
									}}
								/>
								<Line
									type="monotone"
									dataKey="total"
									stroke={accentColor}
									strokeWidth={2}
									dot={{ fill: accentColor }}
								/>
							</LineChart>
						)}
					</ResponsiveContainer>
				</div>
			)}
		</>
	);
}
