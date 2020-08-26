export function showPopup(message, callback) {
    $(".popup").css("display", "block");
    $(".title").html(message);
    
    // only button 1, value will be true anyways, but just to show how to access the button object
    $(".b1").on("click", (e) => {
        var val = $(e.target).val();
        if (val == "true") {
          closePopup();
          typeof (callback) != "undefined" ? callback() : null;

        } else {
          closePopup();
        }
    });
    
    // button 2, try to split as much as you can, makes everything alot easier
    $(".b2").on("click", (e) => {
       closePopup();
    });
}

export function closePopup() {
    $(".popup").css("display", "none");
    setTimeout(() => {
      showPopup("back again", () => { console.log("callback"); });
    }, 2000);
}