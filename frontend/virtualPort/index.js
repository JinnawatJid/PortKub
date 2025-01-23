document.querySelector(".delete-icon").addEventListener("click", () => {
    // SweetAlert confirmation popup
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this asset?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Set all values to "0 USD"
        document.getElementById("currentPrice").textContent = "0 USD";
        document.querySelector(".column2 .profitLossContainer h4:nth-child(1)").textContent = "0 USD";
        document.querySelector(".column2 .profitLossContainer h4:nth-child(2)").textContent = "0 USD";
        document.querySelector(".column3 .profitLossContainer h4:nth-child(1)").textContent = "0 USD";
        document.querySelector(".column3 .profitLossContainer h4:nth-child(2)").textContent = "0 USD";
  
        // Hide the asset detail section (optional)
        document.querySelector(".assetsDetail").style.display = "none";
  
        // Display success message
        Swal.fire("Deleted!", "The asset has been deleted.", "success");
      }
    });
  });
  