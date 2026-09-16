import React from "react";

/**
 * Enterprise High-Level Data Table Component
 * Clean typography, rounded container, responsive overflow, and smooth row hover effects.
 */
function Table({ columns = [], children, empty = false, emptyMessage = "No data available", className = "" }) {
  return (
    <div className={`table-container ${className}`}>
      <div className="overflow-x-auto">
        <table className="table-premium">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={typeof column === "string" ? column : column.key || index}>
                  {typeof column === "string" ? column : column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children}
            {empty && (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="py-12 text-center text-sm text-slate-400"
                >
                  {typeof empty === "string" ? empty : emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
