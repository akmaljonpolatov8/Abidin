import React from "react";
import { Barcode, PencilLine, Plus, Trash2 } from "lucide-react";

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onAddStock,
  compact = false,
}) {
  return (
    <div className="panel border border-[rgba(0,51,102,0.16)] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#003366]">{product.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#003366]/70">
            <Barcode size={14} />
            <span>{product.barcode}</span>
          </div>
        </div>
        <span className="rounded-full border border-[rgba(0,51,102,0.15)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#003366]">
          {Number(product.stock || 0)} dona
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">
            Narx
          </p>
          <p className="mt-1 font-semibold text-[#1a1a1a]">
            {Number(product.price || 0).toLocaleString("uz-UZ")} so'm
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">
            So'nggi kirim
          </p>
          <p className="mt-1 font-semibold text-[#1a1a1a]">
            {product.last_restock_at
              ? new Date(product.last_restock_at).toLocaleString("uz-UZ")
              : "Yo'q"}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onAddStock ? (
            <button
              type="button"
              onClick={() => onAddStock(product)}
              className="btn-success text-xs"
            >
              <Plus size={14} /> Qo'shish
            </button>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="btn-ghost text-xs"
            >
              <PencilLine size={14} /> Tahrirlash
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="btn-danger text-xs"
            >
              <Trash2 size={14} /> O'chirish
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
