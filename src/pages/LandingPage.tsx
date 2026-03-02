import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Загружаем стили лендинга
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/landing/style.css';
    document.head.appendChild(link);

    // Загружаем Font Awesome
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesome);

    // Инициализация скриптов
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    const modalClose = document.querySelector('.modal-close');

    const handleNavToggle = () => {
      navToggle?.classList.toggle('active');
      navMenu?.classList.toggle('active');
    };

    const handleContactClick = (e: Event) => {
      e.preventDefault();
      contactModal?.classList.add('active');
    };

    const handleModalClose = () => {
      contactModal?.classList.remove('active');
    };

    navToggle?.addEventListener('click', handleNavToggle);
    contactBtn?.addEventListener('click', handleContactClick);
    modalClose?.addEventListener('click', handleModalClose);

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
        const target = href ? document.querySelector(href) : null;
        if (target) {
          const offsetTop = (target as HTMLElement).offsetTop - 70;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      });
    });

    // Navbar scroll effect
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar') as HTMLElement;
      if (window.pageYOffset > 100) {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      } else {
        navbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontAwesome);
      navToggle?.removeEventListener('click', handleNavToggle);
      contactBtn?.removeEventListener('click', handleContactClick);
      modalClose?.removeEventListener('click', handleModalClose);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/';
  };

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-brand">ОптБазар.рф</div>
          <button className="nav-toggle" id="navToggle">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul className="nav-menu" id="navMenu">
            <li><a href="#catalog">Каталог</a></li>
            <li><a href="#benefits">Преимущества</a></li>
            <li><a href="#how-it-works">Как работает</a></li>
            <li><a href="#partners">Партнёрам</a></li>
            <li><a href="#contact" className="nav-cta" id="contactBtn">Связаться</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background"></div>
        <div className="container">
          <div className="hero-wrapper">
            <div className="hero-content">
              <h1 className="hero-title">Овощи и фрукты оптом с рынка Азия-Сибирь</h1>
              <p className="hero-subtitle">Экономьте время и деньги — актуальные цены рынка без поездок и пробок</p>
              <div className="hero-badges">
                <div className="badge"><a href="#benefits" style={{color: 'inherit', textDecoration: 'none'}}><i className="fas fa-users"></i> Покупателям</a></div>
                <div className="badge"><a href="#partners" style={{color: 'inherit', textDecoration: 'none'}}><i className="fas fa-store"></i> Продавцам</a></div>
                <div className="badge"><a href="#how-it-works" style={{color: 'inherit', textDecoration: 'none'}}><i className="fas fa-cogs"></i> Как это работает</a></div>
                <div className="badge badge-shop"><a href="/" onClick={handleShopClick} style={{color: 'inherit', textDecoration: 'none'}}><i className="fas fa-shopping-cart"></i> В магазин</a></div>
              </div>
              <div className="hero-social">
                <a href="https://t.me/ASIASIBIR" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-telegram-plane"></i></a>
                <a href="https://vk.com/optbazar_app" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-vk"></i></a>
                <a href="https://max.ru/join/pzoLiNJEYkz7NOr1k9WmFXbHHesDuzh36cbXYzvIDKw" target="_blank" rel="noopener noreferrer" className="social-link max-messenger"><img src="/landing/images/logo_MAX.svg" alt="Макс" className="max-logo" /></a>
              </div>
            </div>
            <div className="hero-phone">
              <div className="phone-mockup">
                <img src="/landing/images/app-screenshot.png" alt="Приложение ОптБазар" className="phone-screen" />
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scroll">
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits" id="benefits">
        <div className="container">
          <h2>Устали от хаоса на рынке?</h2>
          <p className="intro">Каждый день закупщики Новосибирска тратят часы на дорогу, поиск товаров и торг. Цены меняются, наличие не гарантировано, а простои = потерянная выручка.</p>
          
          <div className="comparison">
            <div className="problems">
              <h3>Проблемы</h3>
              <div className="item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
                <span>Риски ДТП и штрафов</span>
              </div>
              <div className="item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Часы в пробках</span>
              </div>
              <div className="item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>Хаос и ожидание</span>
              </div>
              <div className="item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span>Нет гарантий наличия</span>
              </div>
            </div>

            <div className="solutions">
              <h3>ОптБазар решает это:</h3>
              <div className="item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Актуальные цены и наличие обновляются ежедневно</span>
              </div>
              <div className="item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                </svg>
                <span>Заказ в 2 клика без звонков и ожиданий</span>
              </div>
              <div className="item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                <span>Доставка Яндекс по НСО — быстро и надёжно</span>
              </div>
              <div className="item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Экономия 10–20% на закупках за счёт прозрачности</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2>Как работает ОптБазар</h2>
          <div className="roadmap">
            <div className="roadmap-item">
              <div className="roadmap-icon">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                </svg>
              </div>
              <div className="roadmap-content">
                <h3>Выберите товары</h3>
                <p>Цены с рынка Азия-Сибирь обновляются ежедневно</p>
              </div>
            </div>
            <div className="roadmap-item">
              <div className="roadmap-icon">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div className="roadmap-content">
                <h3>Добавьте в корзину</h3>
                <p>Оформите заказ в 2 клика</p>
              </div>
            </div>
            <div className="roadmap-item">
              <div className="roadmap-icon">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="roadmap-content">
                <h3>Подтверждение</h3>
                <p>Мы подтвердим наличие и рассчитаем доставку Яндекс</p>
              </div>
            </div>
            <div className="roadmap-item">
              <div className="roadmap-icon">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div className="roadmap-content">
                <h3>Оплатите</h3>
                <p>Товар + доставка в один клик</p>
              </div>
            </div>
            <div className="roadmap-item">
              <div className="roadmap-icon">
                <i className="fas fa-truck icon"></i>
              </div>
              <div className="roadmap-content">
                <h3>Получите товары</h3>
                <p>Доставка в день заказа</p>
              </div>
            </div>
          </div>
          <p className="tagline">Просто, удобно и без риска.</p>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners" id="partners">
        <div className="container">
          <div className="partners-content">
            <div className="partners-text">
              <h2>Оптовикам: подключитесь бесплатно и получайте заказы</h2>
              <p>Вы — поставщик? Подключите свой склад к ОптБазар:</p>
              <ul>
                <li>
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Получайте готовые заказы без поиска клиентов
                </li>
                <li>
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Комиссия 5–10% только с подтверждённых продаж
                </li>
                <li>
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Мы берём на себя рекламу и доставку
                </li>
                <li>
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Регистрация простая — оставьте заявку
                </li>
              </ul>
            </div>
            <div className="partners-contact">
              <div className="contact-phone">
                <i className="fas fa-phone"></i>
                <a href="tel:+79954992570" className="phone-number">+7 (995) 499-25-70</a>
              </div>
              <div className="partners-social">
                <a href="https://t.me/ASIASIBIR" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-telegram-plane"></i></a>
                <a href="https://vk.com/optbazar_app" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-vk"></i></a>
                <a href="https://max.ru/join/pzoLiNJEYkz7NOr1k9WmFXbHHesDuzh36cbXYzvIDKw" target="_blank" rel="noopener noreferrer" className="social-link max-messenger"><img src="/landing/images/logo_MAX.svg" alt="Макс" className="max-logo" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Начните закупки умнее прямо сейчас</h2>
          <p>Зайдите в магазин и экономьте время и деньги с ОптБазар</p>
          <div className="cta-actions">
            <a href="/" onClick={handleShopClick} className="btn btn-primary btn-large">В магазин</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <p>&copy; 2024 ОптБазар.рф — Маркетплейс Азия-Сибирь</p>
          <p>ИП Хохлов Илья Олегович | ОГРНИП 326547600032713 | ИНН 143303782671</p>
          <p>633100, г. Новосибирск, с.Толмачёво, ул. Озерная, д. 6а</p>
          <p>Email: <a href="mailto:vietnam.amix@gmail.com" style={{color: 'inherit'}}>vietnam.amix@gmail.com</a> | Тел: <a href="tel:+79954992570" style={{color: 'inherit'}}>+7 (995) 499-25-70</a></p>
        </div>
      </footer>

      {/* Contact Modal */}
      <div id="contactModal" className="modal">
        <div className="modal-content">
          <span className="modal-close">&times;</span>
          <h2>Свяжитесь с нами</h2>
          <div className="modal-phone">
            <i className="fas fa-phone"></i>
            <a href="tel:+79954992570">+7 (995) 499-25-70</a>
          </div>
          <div className="modal-social">
            <a href="https://t.me/asia_sib" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-telegram-plane"></i>
              <span>Telegram</span>
            </a>
            <a href="https://vk.com/optbazar_app" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-vk"></i>
              <span>VK</span>
            </a>
            <a href="https://max.ru/join/pzoLiNJEYkz7NOr1k9WmFXbHHesDuzh36cbXYzvIDKw" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src="/landing/images/logo_MAX.svg" alt="Макс" className="max-logo" />
              <span>Макс</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
