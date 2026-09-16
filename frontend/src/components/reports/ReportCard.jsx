import { Link } from "react-router-dom";

function ReportCard({
  title,
  description,
  icon,
  button,
  to,
}) {
  const Icon = icon;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-4 flex items-center gap-3">

        <div className="rounded-lg bg-blue-100 p-3">

          <Icon
            size={26}
            className="text-blue-600"
          />

        </div>

        <div>

          <h2 className="text-xl font-bold">
            {title}
          </h2>

          <p className="text-slate-500">
            {description}
          </p>

        </div>

      </div>

      <Link
        to={to}
        className="inline-block rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
      >
        {button}
      </Link>

    </div>
  );
}

export default ReportCard;