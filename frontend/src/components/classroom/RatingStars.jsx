function RatingStars({
    value,
    field,
    activity,
    onUpdate,
    updateActivity,
}) {

    const click = async (rating) => {

        const updated = await updateActivity(
            activity.id,
            {
                [field]: rating,
            }
        );

        onUpdate(updated);

    };

    return (

        <div className="flex gap-1">

            {[1,2,3,4,5].map((star) => (

                <button
                    key={star}
                    onClick={() => click(star)}
                    className={
                        star <= value
                        ? "text-yellow-500"
                        : "text-slate-300"
                    }
                >

                    ★

                </button>

            ))}

        </div>

    );

}

export default RatingStars;