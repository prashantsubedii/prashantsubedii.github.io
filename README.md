<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prashant Subedi - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }
        body {
            background: linear-gradient(135deg, #1e3d72, #000080);
            color: #fff;
            line-height: 1.6;
            font-size: 1rem;
        }
        nav {
            background-color: rgba(0, 0, 0, 0.7);
            padding: 15px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: fixed;
            width: 100%;
            top: 0;
            left: 0;
            z-index: 1000;
        }
        nav .logo {
            font-size: 1.5rem;
            font-weight: 600;
            color: #FFD700;
        }
        nav a {
            color: #fff;
            text-decoration: none;
            font-size: 1rem;
            margin: 0 15px;
            transition: color 0.3s ease;
        }
        nav a:hover {
            color: #FFD700;
        }
        
        header {
            margin-top: 80px;
            padding: 100px 40px;
            text-align: center;
        }
        header h1 {
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #FFD700;
        }
        header p {
            font-size: 1.2rem;
            color: #ccc;
        }
        header img {
            border-radius: 50%;
            width: 150px;
            height: 150px;
            margin-top: 20px;
            border: 5px solid #1e3d72; /* Changed border color to navy */
        }
        
        .section {
            padding: 60px 40px;
            margin: 20px 0;
            border-radius: 10px;
            background-color: rgba(0, 0, 0, 0.3);
        }
        .section h2 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: #FFD700;
        }
        .skills {
            display: flex;
            justify-content: space-evenly;
            flex-wrap: wrap;
            gap: 20px;
        }
        .skills div {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
            width: 120px;
        }
        .skills div:hover {
            transform: translateY(-10px);
        }
        .skills i {
            font-size: 2rem;
            margin-bottom: 10px;
            color: #fff;  /* Change icon color to white */
        }
        .portfolio {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }
        .portfolio div {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .portfolio h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #FFD700;
        }
        .portfolio p {
            color: #ccc;
        }
        footer {
            background-color: rgba(0, 0, 0, 0.7);
            text-align: center;
            padding: 20px;
            margin-top: 40px;
        }
        footer p {
            color: #ccc;
        }
        .social-icons {
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .social-icons a {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 50px;  /* Adjust size as needed */
            height: 50px; /* Adjust size as needed */
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.5);  /* Dark circle to match theme */
            color: #fff;  /* Icon color set to white */
            font-size: 1.5rem;
            text-decoration: none; /* Removed underline */
            transition: transform 0.3s ease, color 0.3s ease;
        }
        .social-icons a:hover {
            transform: scale(1.2);
        }
        .social-icons .fa-facebook { color: #fff; }
        .social-icons .fa-github { color: #fff; }
        .social-icons .fa-linkedin { color: #fff; }
        .social-icons .fa-instagram { color: #fff; }
        .social-icons .fa-envelope { color: #fff; }
        
        #goToTop {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #FFD700;
            color: #000;
            border: none;
            padding: 10px 15px;
            font-size: 1.5rem;
            border-radius: 50%;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.3s;
            display: none;
        }
        #goToTop:hover {
            background-color: #e6b800;
            transform: scale(1.2);
        }
        #goToTop:before {
            content: "↑";
            font-size: 1.8rem;
        }
        .contact-button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #FFD700;
            color: #000;
            border: none;
            font-size: 1rem;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .contact-button:hover {
            background-color: #e6b800;
        }
    </style>
</head>
<body>

    <nav>
        <div class="logo">Prashant Subedi</div>
        <div>
            <a href="#home">Home</a>
            <a href="#skills">Skills</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#contact">Contact</a>
        </div>
    </nav>

    <header id="home">
        <img src="https://media.licdn.com/dms/image/v2/D4D03AQFcu9qRT_irXQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1725543647245?e=1743638400&v=beta&t=yhF77ZOvTc1UdXZoFbHlNgNcWvc9Lb3rLt21VbqXubE" alt="Prashant Subedi">
        <h1>Prashant Subedi</h1>
        <p>B.Sc. CSIT Student at Lumbini ICT Campus | Passionate about Coding and Web Development</p>
    </header>

    <section id="skills" class="section">
        <h2>Skills</h2>
        <div class="skills">
            <div>
                <i class="fab fa-html5"></i>
                <p>HTML</p>
            </div>
            <div>
                <i class="fab fa-css3-alt"></i>
                <p>CSS</p>
            </div>
            <div>
                <i class="fab fa-js"></i>
                <p>JavaScript</p>
            </div>
            <div>
                <i class="fab fa-python"></i>
                <p>Python</p>
            </div>
            <div>
                <i class="fas fa-code"></i>
                <p>C</p>
            </div>
            <div>
                <i class="fab fa-github"></i>
                <p>GitHub</p>
            </div>
        </div>
    </section>

    <section id="portfolio" class="section">
        <h2>Portfolio</h2>
        <div class="portfolio">
            <div>
                <h3>Personal Portfolio Website</h3>
                <p>A dynamic and responsive portfolio website created to showcase my projects and skills.</p>
            </div>
            <div>
                <h3>Web Development Projects</h3>
                <p>Focusing on front-end web development with HTML, CSS, and JavaScript to build dynamic websites.</p>
            </div>
        </div>
    </section>

    <section id="contact" class="section">
        <h2>Contact</h2>
        <p>If you want to collaborate, chat, or have any questions, feel free to reach out to me on GitHub, LinkedIn, or email!</p>
        <button class="contact-button" onclick="window.location.href='mailto:contactprashantsubedi@gmail.com'">Email Me</button>
    </section>

    <footer>
        <p>&copy; 2025 Prashant Subedi. All rights reserved.</p>
        <p>Made with <span style="color: #ff0000;">❤</span> by Prashant Subedi</p>
    </footer>

    <!-- Social Media Links Fixed on Right Side -->
    <div class="social-icons">
        <a href="https://fb.com/prashantsubedii" target="_blank">
            <i class="fab fa-facebook"></i>
        </a>
        <a href="https://github.com/prashantsubedii" target="_blank">
            <i class="fab fa-github"></i>
        </a>
        <a href="https://www.linkedin.com/in/prashantsubedii/" target="_blank">
            <i class="fab fa-linkedin"></i>
        </a>
        <a href="https://www.instagram.com/prashantsubedii/" target="_blank">
            <i class="fab fa-instagram"></i>
        </a>
        <a href="mailto:contactprashantsubedi@gmail.com" target="_blank">
            <i class="fas fa-envelope"></i>
        </a>
    </div>

    <button id="goToTop" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })"></button>

</body>
</html>
