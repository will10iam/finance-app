import React from "react";
import "./index.css";

export default function ProgressBar({
	label,
	percentage,
	color,
	remainingValue = 0, //valor restante para completar 100%
}) {
	const showRemaining = percentage < 100; // só mostra se não estiver completo
	const remainingPercent = 100 - percentage;

	return (
		<div className="progress-container">
			{/* Primeira barra — progresso atual */}
			<div className="progress-header">
				<span>{label}</span>
				<span>{percentage.toFixed(0)}%</span>
			</div>
			<div className="progress-bar">
				<div
					className="progress-fill"
					style={{ width: `${percentage}%`, backgroundColor: color }}
				></div>
			</div>

			{/* Segunda barra — quanto falta */}
			{showRemaining && (
				<div className="progress-remaining">
					<div className="progress-header">
						<span>Falta receber/pagar</span>
						<span>{remainingPercent.toFixed(0)}%</span>
					</div>
					<div className="progress-bar">
						<div
							className="progress-fill remaining"
							style={{
								width: `${remainingPercent}%`,
								backgroundColor: "#ccc",
							}}
						></div>
					</div>
					<div className="remaining-info">
						<small>
							Restante: <strong>{remainingValue.toFixed(2)}</strong>
						</small>
					</div>
				</div>
			)}
		</div>
	);
}
