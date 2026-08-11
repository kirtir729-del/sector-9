from collections import deque


class TrendDetector:

    def __init__(self, window_size=3):

        self.levels = deque(
            maxlen=window_size
        )

    def add_level(self, level):

        self.levels.append(level)

    def get_trend(self):

        if len(self.levels) < 2:
            return "INSUFFICIENT_DATA"

        values = list(self.levels)

        change = values[-1] - values[0]

        if change >= 2:
            return "RAPIDLY_INCREASING"

        if change == 1:
            return "INCREASING"

        if change == 0:
            return "STABLE"

        if change == -1:
            return "DECREASING"

        return "RAPIDLY_DECREASING"

    def should_alert(self):

        if len(self.levels) < 3:
            return False

        values = list(self.levels)

        return (
            values[-1] >= 3
            and values[-2] >= 3
            and values[-3] >= 3
        )


if __name__ == "__main__":

    detector = TrendDetector(3)

    for level in [3, 4, 4]:

        detector.add_level(level)

    print("Trend:", detector.get_trend())
    print("Alert:", detector.should_alert())