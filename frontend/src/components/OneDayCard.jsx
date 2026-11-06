let goalsBasedOnPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
import { Card } from "../components/ui/card"
export default function OneDayCard() {

    return (
        <div>
            {
                goalsBasedOnPrayers.map((item) => (
                    <Card key={item}>
                        item

                    </Card>
                ))


            }
        </div>

    )

}