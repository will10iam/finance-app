import React from "react";
import "./index.css";
import { CaretDownIcon } from "@phosphor-icons/react";

export default function ProgressBar({
	label,
	percentage,
	color,
	remainingValue = 0, //valor restante para completar 100%
	open,
	onToggle,
}) {
	const showRemaining = percentage < 100; // só mostra se não estiver completo
	const remainingPercent = 100 - percentage;

	return (
		<div className="progress-container">
			{/* Barra principal */}
			<div className="progress-header">
				<span>{label}</span>

				<div className="progress-header-right">
					<span>{percentage.toFixed(0)}%</span>

					{showRemaining && (
						<button
							className={`progress-dropdown ${open ? "open" : ""}`}
							onClick={onToggle}
							type="button"
						>
							<CaretDownIcon size={32} />
						</button>
					)}
				</div>
			</div>

			<div className="progress-bar">
				<div
					className="progress-fill"
					style={{ width: `${percentage}%`, backgroundColor: color }}
				/>
			</div>

			{/* Dropdown */}
			{showRemaining && open && (
				<div className="progress-remaining">
					<div className="progress-header">
						<span>R$ {remainingValue.toFixed(2)}</span>
						<span>{remainingPercent.toFixed(0)}%</span>
					</div>

					<div className="progress-bar">
						<div
							className="progress-fill remaining"
							style={{
								width: `${remainingPercent}%`,
								backgroundColor: "#ccc",
							}}
						/>
					</div>

					<div className="remaining-info">
						<small>Ainda falta</small>
					</div>
				</div>
			)}
		</div>
	);
}
