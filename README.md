<div align="center">

# 🎓 DIU PDF BOX

![DIU PDF BOX Banner](Logos/DIU%20PDF%20BOX.png)

### **Enterprise-grade Academic PDF Orchestrator**
A high-performance, client-side web application designed for students at **Daffodil International University** to streamline the generation of standardized academic documentation.

</div>

---

## 💎 Features

*   🟦 **Intelligent Templating**: Dynamic generation of DIU-standard cover pages for Assignments, Lab Reports, and Quizzes.
*   🟧 **Client-Side Processing**: Leveraging the power of the browser for PDF synthesis—ensuring zero latency and maximum privacy.
*   🟩 **Fluid UX**: Modern, responsive interface with adaptive light/dark theming and smooth micro-interactions.
*   🟪 **Advanced Asset Handling**: Drag-and-drop orchestration with support for multi-format merging (Images & PDFs).
*   🟫 **Optimized Compression**: Integrated asset compression algorithms to maintain professional quality with minimal file footprint.
*   🟥 **Real-time Preview**: High-fidelity document rendering before final export.

---

## 🛠 Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | Core UI & Logic |
| **PDF Engine** | [pdf-lib](https://pdf-lib.js.org/) | Low-level PDF manipulation & synthesis |
| **Sortable** | [SortableJS](https://sortablejs.github.io/Sortable/) | Reorderable page orchestration |
| **Design** | [Inter Font](https://rsms.me/inter/) & [FontAwesome](https://fontawesome.com/) | Typography & Iconography |

---

## 🚀 Architectural Overview

DIU PDF BOX operates on a **Privacy-First (Zero-Server)** architecture. Unlike traditional PDF tools, all document manipulation occurs locally within the user's browser environment.

1.  **Metadata Injection**: Form data is mapped to high-resolution coordinate planes on standardized DIU templates.
2.  **Asset Buffer Management**: Uploaded images and PDFs are converted to ArrayBuffers for unified processing.
3.  **PDF Synthesis**: The `pdf-lib` engine merges the generated cover page with user assets into a single document stream.
4.  **Blob Orchestration**: The final document is served via an ephemeral Blob URL for instant preview and download.

---

## 💻 Local Development

To run this project locally for development or testing:

```bash
# Clone the repository
git clone https://github.com/shejanahmmed/DIU-PDF-BOX.git

# Navigate to the project directory
cd DIU-PDF-BOX

# Serve using any local web server (e.g., Live Server in VS Code)
```

---

## 🔒 Security & Privacy

This application is designed with **Privacy by Design** principles:
- **No Server Uploads**: Your academic documents never leave your device.
- **No Data Persistence**: Session data is cleared upon page refresh.
- **No Analytics Tracking**: We respect your academic focus.

---

## 👤 Author

**Farjan Ahmmed (Shejan)**  
*Software Engineering Student @ Daffodil International University*  
📍 Dhaka, Bangladesh

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/farjan-ahmmed/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/shejanahmmed)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:farjan.swe@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌐 Deployment

Live version available at: [**https://shejanahmmed.github.io/DIU-PDF-BOX/**](https://shejanahmmed.github.io/DIU-PDF-BOX/)
