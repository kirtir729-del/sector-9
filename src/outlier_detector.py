def detect_outliers(deviations, threshold=2.0):
    """
    Detect features that deviate significantly
    from the driver's personal baseline.

    deviations:
        Dictionary containing feature z-scores.

    threshold:
        Z-score above which a feature is considered
        an outlier.
    """

    outliers = {}

    for feature, score in deviations.items():

        if score >= threshold:
            outliers[feature] = round(
                score,
                2
            )

    return outliers


if __name__ == "__main__":

    print("Silent Co-Driver Outlier Detector")
    print("Issue detection module ready.")