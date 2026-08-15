def generate_alert(driver_state, outliers=None, trend=None):
    """
    Generate an alert based on the driver's current state,
    detected outliers, and risk trend.
    """

    outliers = outliers or {}

    level = driver_state.get("level", 0)
    risk_score = driver_state.get("risk_score", 0)

    alert = False
    reasons = []

    # High driver-state level
    if level >= 3:
        alert = True
        reasons.append(
            f"Driver risk level is {level}."
        )

    # Significant feature deviations
    if outliers:
        alert = True
        reasons.append(
            "Significant deviation detected in: "
            + ", ".join(outliers.keys())
        )

    # Persistent/increasing risk
    if trend in (
        "RAPIDLY_INCREASING",
        "INCREASING"
    ):
        alert = True
        reasons.append(
            f"Risk trend is {trend.lower().replace('_', ' ')}."
        )

    return {
        "alert": alert,
        "risk_score": risk_score,
        "reasons": reasons
    }


if __name__ == "__main__":

    print("Silent Co-Driver Alert Manager")
    print("Alert generation module ready.")