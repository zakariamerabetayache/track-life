function getcurrentDate(req, res, next) {

    try {
        let currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("en-GB", {
            timeZone: "Africa/Algiers",
        }).replace(/\//g, "-");
        res.json({
            success: true,
            data: {
                currentDate: formattedDate
            },
        });



    } catch (error) {
        next(error);
    }
}