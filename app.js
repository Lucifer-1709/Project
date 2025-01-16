const dayNightTheme = () => {
    let date = new Date();
    let hour = date.getHours();
  
    if (hour >= 7 && hour < 19) {
      document.body.style.backgroundColor = 'white';
      document.body.style.color = 'black';
    } else {
      document.body.style.backgroundColor = 'black';
      document.body.style.color = 'white';
    }
  };
  
  window.addEventListener('load', dayNightTheme);
  

  document.querySelector("#input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      apiRequest();
    }
  });
  
  document.querySelector("#search").addEventListener("click", () => {
    apiRequest();
  });
  

  const apiRequest = () => {
    const input = document.querySelector("#input").value.trim();  
    if (!input) return; 
  
    document.querySelector("#grid").textContent = "";  
  
    const url = `https://api.unsplash.com/search/photos?query=${input}&per_page=30&client_id=SouHY7Uul-OxoMl3LL3c0NkxUtjIrKwf3tsGk1JaiVo`;
  
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
      })
      .then(data => {
        loadImages(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert('Something went wrong. Please try again later.');
      });
  };
  
  
  const loadImages = (data) => {
    const grid = document.querySelector("#grid");
  
    if (data.results.length === 0) {
      grid.innerHTML = "<p>No images found. Please try a different search.</p>";
      return;
    }
  
    data.results.forEach(item => {
      const image = document.createElement("div");
      image.className = "img";
      image.style.backgroundImage = `url(${item.urls.raw}&w=1366&h=768)`;
  


      
      image.addEventListener("dblclick", () => {
        window.open(item.links.download, '_blank');
      });
  
      grid.appendChild(image);
    });
  };
  
