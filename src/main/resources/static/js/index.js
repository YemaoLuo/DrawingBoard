function enter() {
    const id = document.getElementById("id").value
    console.log("enter id=" + id)
    if (id === "") {
        alert("Please enter a valid id.")
        return;
    }
    window.location.href = "/board.html?id=" + id
}
