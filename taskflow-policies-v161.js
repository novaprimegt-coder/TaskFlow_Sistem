/* Políticas compartidas por el primer ingreso y el menú de TaskFlow. */
(() => {
'use strict';
if (window.TaskFlowPoliciesV161) return;
const VERSION = '2026-11-12.v161';
const STORAGE_KEY = 'taskflow_policy_acceptance';
const policyMarkup = `<section class="policy-page" id="policyPage" aria-hidden="true" aria-label="Políticas de TaskFlow">
        <header class="policy-page-bar">
            <div class="policy-page-title"><span class="policy-brand-mark"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3 19 6v5c0 4.8-2.8 8.1-7 10-4.2-1.9-7-5.2-7-10V6l7-3Z"/><path d="M12 3v18"/><path d="M8.5 10.5h3.5"/></svg></span><div><strong>Políticas de TaskFlow</strong><span>Uso · Privacidad · Recompensas · Publicidad y membresía</span></div></div>
            <div class="policy-reading"><span id="policyReadingPercent">0%</span><small>LEÍDO</small></div>
            <div class="policy-progress-track" aria-hidden="true"><span id="policyProgressBar"></span></div>
        </header>
        <main class="policy-page-inner"><div class="policy-shell">
                    <section class="policy-hero">
                        <div class="policy-kicker">Centro legal y de transparencia</div>
                        <h3>Políticas de uso, privacidad y funcionamiento</h3>
                        <p>Estas políticas explican cómo funciona TaskFlow, qué datos guarda, qué significan sus sistemas de hábitos, tareas, puntos, recompensas y tienda, y cuáles son las responsabilidades del usuario al utilizarlo.</p>
                        <div class="policy-meta">
                            <div><span>Versión</span><strong>V161 · Políticas de TaskFlow</strong></div>
                            <div><span>Última actualización</span><strong>12 de noviembre de 2026</strong></div>
                            <div><span>Almacenamiento principal</span><strong>Local en el dispositivo</strong></div>
                            <div><span>Ámbito</span><strong>TaskFlow</strong></div>
                        </div>
                    </section>

                    <div class="policy-notice"><strong>Importante:</strong> TaskFlow es una herramienta personal de organización, disciplina y progreso. Estas políticas explican de forma clara cómo funciona el servicio, qué información conserva, qué responsabilidades tiene el usuario y qué límites existen. No sustituyen asesoría jurídica, médica, financiera ni profesional.</div>

                    <section class="policy-overview" aria-label="Resumen de políticas">
                        <div class="policy-overview-head">
                            <div><span class="policy-mini-kicker">Resumen rápido</span><h4>Lo esencial antes de continuar</h4></div>
                            <span class="policy-count-pill">19 secciones</span>
                        </div>
                        <div class="policy-overview-grid">
                            <article><span class="policy-overview-icon privacy"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3"/><path d="M3.5 18c.8-3 2.6-4.7 5.5-4.7 1.4 0 2.6.4 3.5 1.1"/><path d="m17 11 4 1.6v3c0 2.5-1.4 4.3-4 5.4-2.6-1.1-4-2.9-4-5.4v-3L17 11Z"/><path d="m15.5 15.8 1 1 2-2"/></svg></span><div><strong>Privacidad</strong><small>Control de la información registrada.</small></div></article>
                            <article><span class="policy-overview-icon progress"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/><circle cx="7" cy="15" r=".8" fill="currentColor" stroke="none"/><circle cx="11" cy="11" r=".8" fill="currentColor" stroke="none"/><circle cx="14" cy="13" r=".8" fill="currentColor" stroke="none"/><circle cx="19" cy="7" r=".8" fill="currentColor" stroke="none"/></svg></span><div><strong>Progreso</strong><small>Puntos, rangos, rachas y penalizaciones.</small></div></article>
                            <article><span class="policy-overview-icon reward"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 10h16v10H4z"/><path d="M12 10v10"/><path d="M3 7h18v3H3z"/><path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5L12 7Z"/><path d="M12 7h3.5A2.5 2.5 0 1 0 13 4.5L12 7Z"/></svg></span><div><strong>Recompensas</strong><small>Reglas de recompensas y tienda.</small></div></article>
                            <article><span class="policy-overview-icon safety"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3 19 6v5c0 4.8-2.8 8.1-7 10-4.2-1.9-7-5.2-7-10V6l7-3Z"/><path d="M12 15.6s-3-1.8-3-4a1.8 1.8 0 0 1 3-1.3 1.8 1.8 0 0 1 3 1.3c0 2.2-3 4-3 4Z"/></svg></span><div><strong>Responsabilidad</strong><small>Uso consciente, salud y decisiones personales.</small></div></article>
                        </div>
                    </section>

                    <nav class="policy-toc" aria-label="Índice de políticas">
                        <a href="#pol-terms"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 12h6M9 15h6"/><path d="m9 18 1.2 1.2L12.5 17"/></svg>Términos de uso</a>
                        <a href="#pol-privacy"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3"/><path d="M3.5 18c.8-3 2.6-4.7 5.5-4.7 1.4 0 2.6.4 3.5 1.1"/><path d="m17 11 4 1.6v3c0 2.5-1.4 4.3-4 5.4-2.6-1.1-4-2.9-4-5.4v-3L17 11Z"/><path d="m15.5 15.8 1 1 2-2"/></svg>Privacidad</a>
                        <a href="#pol-storage"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>Datos guardados</a>
                        <a href="#pol-permissions"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8"/><path d="M10 20h4"/></svg>Notificaciones y permisos</a>
                        <a href="#pol-gamification"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/><circle cx="7" cy="15" r=".8" fill="currentColor" stroke="none"/><circle cx="11" cy="11" r=".8" fill="currentColor" stroke="none"/><circle cx="14" cy="13" r=".8" fill="currentColor" stroke="none"/><circle cx="19" cy="7" r=".8" fill="currentColor" stroke="none"/></svg>Puntos y rangos</a>
                        <a href="#pol-rewards"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 10h16v10H4z"/><path d="M12 10v10"/><path d="M3 7h18v3H3z"/><path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5L12 7Z"/><path d="M12 7h3.5A2.5 2.5 0 1 0 13 4.5L12 7Z"/></svg>Recompensas</a>
                        <a href="#pol-store"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 10v10h16V10"/><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M8 20v-6h8v6"/><path d="M3 10c.3 1.7 1.3 2.5 3 2.5S8.7 11.7 9 10c.3 1.7 1.3 2.5 3 2.5s2.7-.8 3-2.5c.3 1.7 1.3 2.5 3 2.5s2.7-.8 3-2.5"/></svg>Tienda</a>
                        <a href="#pol-health"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20.8 5.8c-2-2-5.2-1.8-7 .3L12 8.2l-1.8-2.1c-1.8-2.1-5-2.3-7-.3-2.1 2.1-2.1 5.5 0 7.6L12 21l4-3.6"/><path d="M3.5 14h4l1.4-3 2.1 6 1.8-4h3.2"/></svg>Salud y ejercicio</a>
                        <a href="#pol-money"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><ellipse cx="9" cy="7" rx="5" ry="2.5"/><path d="M4 7v4c0 1.4 2.2 2.5 5 2.5.7 0 1.3-.1 1.9-.2"/><path d="M4 11v4c0 1.4 2.2 2.5 5 2.5"/><ellipse cx="16" cy="14" rx="4" ry="2"/><path d="M12 14v4c0 1.1 1.8 2 4 2s4-.9 4-2v-4"/></svg>Metas económicas</a>
                        <a href="#pol-content"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M15 9.5a4 4 0 1 0 0 5"/></svg>Contenido e identidad</a>
                        <a href="#pol-security"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg>Seguridad</a>
                        <a href="#pol-backup"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="m5 14 2-5h10l2 5"/><circle cx="16.5" cy="15.5" r=".8" fill="currentColor" stroke="none"/><circle cx="19" cy="15.5" r=".8" fill="currentColor" stroke="none"/></svg>Respaldo</a>
                        <a href="#pol-third"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 4 4-2 4 2-4 2-4-2Z"/><path d="M8 4v4l4 2 4-2V4"/><path d="m3 12 4-2 4 2-4 2-4-2Z"/><path d="M3 12v4l4 2 4-2v-4"/><path d="m13 12 4-2 4 2-4 2-4-2Z"/><path d="M13 12v4l4 2 4-2v-4"/></svg>Servicios externos</a>
                        <a href="#pol-minors"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="5" r="2"/><path d="M12 7v6"/><path d="m12 9-5 2M12 9l5 2"/><path d="m12 13-3 7M12 13l3 7"/></svg>Menores</a>
                        <a href="#pol-rights"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 6h7M15 6h5"/><circle cx="13" cy="6" r="2"/><path d="M4 12h3M11 12h9"/><circle cx="9" cy="12" r="2"/><path d="M4 18h10M18 18h2"/><circle cx="16" cy="18" r="2"/></svg>Control de datos</a>
                        <a href="#pol-liability"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5"/><circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none"/></svg>Responsabilidad</a>
                        <a href="#pol-changes"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 8V4h4"/><path d="M5.5 5.5A8 8 0 1 1 4 14"/></svg>Cambios</a>
                        <a href="#pol-law"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v18M7 6h10M4 8l-3 6h6L4 8ZM20 8l-3 6h6l-3-6Z"/><path d="M7 21h10"/></svg>Marco aplicable</a>
                        <a href="#pol-contact"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M5.5 15c.6-1.8 1.5-2.7 2.5-2.7s1.9.9 2.5 2.7M13 9h5M13 12h5M13 15h3"/></svg>Responsable</a>
                                            <a href="#pol-ads-topics">Preferencias de anuncios</a>
                        <a href="#pol-membership">Membresía Sin anuncios</a>
                    </nav>

                    <section class="policy-section" id="pol-terms">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 12h6M9 15h6"/><path d="m9 18 1.2 1.2L12.5 17"/></svg>1. Términos y condiciones de uso</h4>
                        <p>Al utilizar TaskFlow, el usuario acepta que su finalidad principal es ayudar a organizar hábitos, tareas, misiones obligatorias, progreso, recompensas, rachas y disciplina personal.</p>
                        <ul>
                            <li>El usuario es responsable de la información que registra y de comprobar que fechas, metas, cantidades y estados sean correctos.</li>
                            <li>TaskFlow no garantiza resultados académicos, físicos, económicos, laborales ni personales.</li>
                            <li>Los puntos, EXP, niveles, rangos, rachas y penalizaciones son elementos internos de motivación y no representan dinero real, crédito, salario, inversión ni deuda.</li>
                            <li>El uso debe hacerse de forma lícita, responsable y sin utilizar TaskFlow para engañar, falsificar resultados o perjudicar a terceros.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-privacy">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3"/><path d="M3.5 18c.8-3 2.6-4.7 5.5-4.7 1.4 0 2.6.4 3.5 1.1"/><path d="m17 11 4 1.6v3c0 2.5-1.4 4.3-4 5.4-2.6-1.1-4-2.9-4-5.4v-3L17 11Z"/><path d="m15.5 15.8 1 1 2-2"/></svg>2. Política de privacidad</h4>
                        <p>TaskFlow está pensado para conservar la información principal del usuario en su propio dispositivo. No requiere una cuenta personal obligatoria para utilizar las funciones principales descritas en esta versión.</p>
                        <h5>Información que puede registrar el usuario</h5>
                        <ul>
                            <li>Tareas, títulos, descripciones, prioridades, fechas y estados de cumplimiento.</li>
                            <li>Hábitos, categorías, cursos, frecuencia y registros de cumplimiento.</li>
                            <li>Misiones obligatorias y su estado diario.</li>
                            <li>Puntos, EXP, niveles, rangos, rachas, penalizaciones y recompensas.</li>
                            <li>Estado de la misión económica diaria de Q100 y progreso del ciclo de la tienda.</li>
                            <li>Preferencias y otros datos necesarios para conservar el progreso personal.</li>
                        </ul>
                        <p>No deben registrarse contraseñas bancarias, números completos de tarjeta, claves privadas, PIN, credenciales financieras ni documentos de identidad en campos de notas o textos personales.</p>
                    </section>

                    <section class="policy-section" id="pol-storage">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>3. Datos guardados en el dispositivo</h4>
                        <p>TaskFlow guarda información de progreso en el dispositivo para que las tareas, hábitos, rangos, recompensas y demás avances permanezcan disponibles entre usos.</p>
                        <ul>
                            <li>Los datos pueden perderse si se eliminan los datos de TaskFlow, se restaura el dispositivo, se reinstala la aplicación o se cambia de dispositivo sin una copia de respaldo.</li>
                            <li>TaskFlow utiliza los temas publicitarios que el usuario elige en Preferencias de anuncios. Las tareas, notas, hábitos, datos financieros y contenido personal se reservan para las funciones de TaskFlow.</li>
                            <li>El usuario debe mantener copias de respaldo cuando la información acumulada sea importante para él.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-permissions">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8"/><path d="M10 20h4"/></svg>4. Notificaciones, compartir y permisos</h4>
                        <p>TaskFlow puede solicitar permisos del dispositivo para funciones como notificaciones o compartir información cuando el usuario decide utilizarlas.</p>
                        <ul>
                            <li>El usuario puede aceptar o rechazar permisos disponibles desde la configuración de su dispositivo.</li>
                            <li>La entrega exacta de una notificación puede variar según las restricciones de energía, permisos o funcionamiento del dispositivo.</li>
                            <li>Al compartir contenido hacia otra aplicación o servicio, el tratamiento posterior de esa información depende del destino elegido por el usuario.</li>
                        </ul>

                        <p><strong>Ubicación del dispositivo.</strong> Con tu permiso, TaskFlow usa la ubicación en tu dispositivo exclusivamente para ajustar la zona horaria del reloj del sistema. Las coordenadas se quedan en el dispositivo y TaskFlow no las envía ni las comparte con terceros. Puedes usar la zona horaria del dispositivo si prefieres omitir el permiso.</p>
                    </section>

                    <section class="policy-section" id="pol-gamification">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/><circle cx="7" cy="15" r=".8" fill="currentColor" stroke="none"/><circle cx="11" cy="11" r=".8" fill="currentColor" stroke="none"/><circle cx="14" cy="13" r=".8" fill="currentColor" stroke="none"/><circle cx="19" cy="7" r=".8" fill="currentColor" stroke="none"/></svg>5. Puntos, EXP, niveles, rangos, rachas y penalizaciones</h4>
                        <p>La progresión de TaskFlow sirve como mecanismo de motivación y disciplina. Las estadísticas pueden aumentar o disminuir según el cumplimiento real registrado.</p>
                        <ul>
                            <li>Completar una tarea, hábito o misión obligatoria puede otorgar EXP o puntos.</li>
                            <li>Desmarcar un elemento ya completado puede revertir la recompensa obtenida y aplicar la penitencia adicional vigente.</li>
                            <li>Los incumplimientos pueden afectar racha, puntos, EXP, recompensas y acceso a la tienda.</li>
                            <li>Los rangos son representaciones internas de progreso y no equivalen a títulos académicos, profesionales, deportivos ni jurídicos.</li>
                            <li>La dificultad puede aumentar conforme el usuario avanza.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-rewards">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 10h16v10H4z"/><path d="M12 10v10"/><path d="M3 7h18v3H3z"/><path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5L12 7Z"/><path d="M12 7h3.5A2.5 2.5 0 1 0 13 4.5L12 7Z"/></svg>6. Política de recompensas diarias</h4>
                        <p>Las recompensas diarias son incentivos personales que TaskFlow puede autorizar únicamente cuando se cumplen las condiciones exigidas del día.</p>
                        <ul>
                            <li>La recompensa puede permanecer bloqueada hasta que se completen todas las obligaciones activas requeridas.</li>
                            <li>El presupuesto diario no debe superar Q20.</li>
                            <li>TaskFlow puede decidir qué recompensa específica corresponde ese día, priorizando opciones moderadas y compatibles con el presupuesto.</li>
                            <li>TaskFlow no entrega dinero, no procesa pagos ni compra productos en nombre del usuario.</li>
                            <li>El usuario es responsable de verificar precio, disponibilidad, alergias, restricciones alimentarias y conveniencia antes de realizar una compra real.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-store">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 10v10h16V10"/><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M8 20v-6h8v6"/><path d="M3 10c.3 1.7 1.3 2.5 3 2.5S8.7 11.7 9 10c.3 1.7 1.3 2.5 3 2.5s2.7-.8 3-2.5c.3 1.7 1.3 2.5 3 2.5s2.7-.8 3-2.5"/></svg>7. Política de la Tienda especial</h4>
                        <p>La Tienda es un sistema interno de recompensas de largo plazo y no una tienda comercial.</p>
                        <ul>
                            <li>Su apertura depende del cumplimiento continuo durante el período establecido por TaskFlow.</li>
                            <li>Un solo día de incumplimiento puede reiniciar completamente el ciclo cuando esa sea la regla vigente.</li>
                            <li>Cuando se desbloquea, TaskFlow puede presentar varias opciones y permitir elegir solo una.</li>
                            <li>Una recompensa elegida puede quedar excluida temporalmente para evitar que vuelva a aparecer demasiado pronto.</li>
                            <li>TaskFlow no garantiza existencia, precio, entrega, calidad ni disponibilidad física de ninguna recompensa sugerida.</li>
                        </ul>
                    </section>

                    <section class="policy-section policy-danger" id="pol-health">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20.8 5.8c-2-2-5.2-1.8-7 .3L12 8.2l-1.8-2.1c-1.8-2.1-5-2.3-7-.3-2.1 2.1-2.1 5.5 0 7.6L12 21l4-3.6"/><path d="M3.5 14h4l1.4-3 2.1 6 1.8-4h3.2"/></svg>8. Salud, ejercicio y rutina física</h4>
                        <p>Las misiones físicas son retos de disciplina y no sustituyen evaluación médica ni entrenamiento personalizado.</p>
                        <ul>
                            <li>No debe continuarse una actividad que provoque dolor agudo, mareo, desmayo, dificultad respiratoria anormal o síntomas preocupantes.</li>
                            <li>El usuario debe adaptar volumen, distancia, intensidad y frecuencia a su condición física real.</li>
                            <li>Marcar una misión como completada es una declaración del usuario; TaskFlow no verifica físicamente que el ejercicio haya sido realizado.</li>
                            <li>Las recompensas relacionadas con alimentos son sugerencias generales y no recomendaciones nutricionales personalizadas.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-money">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><ellipse cx="9" cy="7" rx="5" ry="2.5"/><path d="M4 7v4c0 1.4 2.2 2.5 5 2.5.7 0 1.3-.1 1.9-.2"/><path d="M4 11v4c0 1.4 2.2 2.5 5 2.5"/><ellipse cx="16" cy="14" rx="4" ry="2"/><path d="M12 14v4c0 1.1 1.8 2 4 2s4-.9 4-2v-4"/></svg>9. Meta económica diaria</h4>
                        <p>La misión “Ganar Q100” es una meta personal de productividad. No representa una promesa de ingresos, una inversión ni una garantía de rentabilidad.</p>
                        <ul>
                            <li>El usuario es responsable de que los ingresos registrados sean reales, legítimos y obtenidos de forma lícita.</li>
                            <li>TaskFlow no verifica cuentas bancarias ni confirma que el ingreso exista.</li>
                            <li>Las penalizaciones por incumplimiento solo afectan las estadísticas internas de TaskFlow y no crean deudas reales.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-content">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M15 9.5a4 4 0 1 0 0 5"/></svg>10. Contenido, identidad y propiedad intelectual</h4>
                        <p>TaskFlow mantiene una identidad visual propia. Las referencias culturales o temáticas utilizadas como inspiración no otorgan derechos sobre obras, marcas, personajes o diseños pertenecientes a terceros.</p>
                        <ul>
                            <li>Las marcas, nombres y obras de terceros pertenecen a sus respectivos titulares.</li>
                            <li>El usuario no adquiere derechos sobre propiedad intelectual ajena por utilizar referencias personales dentro de TaskFlow.</li>
                            <li>Cualquier distribución pública o comercial debe respetar los derechos de terceros aplicables.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-security">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg>11. Seguridad</h4>
                        <p>La información personal de TaskFlow debe considerarse privada y protegerse mediante las medidas de seguridad disponibles en el dispositivo.</p>
                        <ul>
                            <li>No introducir secretos, contraseñas, PIN, tarjetas, información médica detallada ni otra información altamente sensible.</li>
                            <li>Mantener activo el bloqueo de pantalla y las medidas de seguridad del dispositivo.</li>
                            <li>Utilizar únicamente copias de TaskFlow obtenidas de una fuente de confianza.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-backup">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="m5 14 2-5h10l2 5"/><circle cx="16.5" cy="15.5" r=".8" fill="currentColor" stroke="none"/><circle cx="19" cy="15.5" r=".8" fill="currentColor" stroke="none"/></svg>12. Pérdida de datos, respaldo y restauración</h4>
                        <p>La información guardada puede perderse por eliminación accidental, daño del dispositivo, restauración, cambio de dispositivo o fallas imprevistas.</p>
                        <ul>
                            <li>Cuando esté disponible una función de respaldo, se recomienda realizar copias periódicas.</li>
                            <li>No se garantiza la recuperación de información eliminada si no existe una copia previa.</li>
                            <li>Antes de realizar cambios importantes, el usuario debe proteger la información que desee conservar.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-third">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 4 4-2 4 2-4 2-4-2Z"/><path d="M8 4v4l4 2 4-2V4"/><path d="m3 12 4-2 4 2-4 2-4-2Z"/><path d="M3 12v4l4 2 4-2v-4"/><path d="m13 12 4-2 4 2-4 2-4-2Z"/><path d="M13 12v4l4 2 4-2v-4"/></svg>13. Servicios externos</h4>
                        <p>Algunas acciones iniciadas por el usuario, como compartir contenido, abrir enlaces o utilizar servicios del dispositivo, pueden involucrar servicios externos a TaskFlow.</p>
                        <p>Una vez que el usuario sale de TaskFlow o envía información a otro servicio, se aplican las condiciones y políticas de ese destino. TaskFlow no controla el tratamiento realizado por servicios externos.</p>
                    </section>

                    <section class="policy-section" id="pol-minors">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="5" r="2"/><path d="M12 7v6"/><path d="m12 9-5 2M12 9l5 2"/><path d="m12 13-3 7M12 13l3 7"/></svg>14. Menores de edad</h4>
                        <p>Si un menor utiliza TaskFlow, su padre, madre o responsable debe supervisar especialmente las metas físicas, económicas, recompensas, compras y la información que se registre.</p>
                    </section>

                    <section class="policy-section" id="pol-rights">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 6h7M15 6h5"/><circle cx="13" cy="6" r="2"/><path d="M4 12h3M11 12h9"/><circle cx="9" cy="12" r="2"/><path d="M4 18h10M18 18h2"/><circle cx="16" cy="18" r="2"/></svg>15. Control, corrección y eliminación de datos</h4>
                        <p>El usuario conserva control sobre la información que registra en TaskFlow y puede modificar o eliminar datos mediante las funciones disponibles. TaskFlow no elimina automáticamente tareas, hábitos, categorías o cursos creados por el usuario únicamente por antigüedad o cantidad.</p>
                        <ul>
                            <li>Corregir información: editar tareas, hábitos, categorías u otros datos cuando la función esté disponible.</li>
                            <li>Eliminar información: borrar elementos individuales o eliminar los datos guardados de TaskFlow.</li>
                            <li>Retirar permisos: utilizar la configuración del dispositivo cuando corresponda.</li>
                            <li>Antes de eliminar información de forma general, realizar un respaldo si desea conservar el historial.</li>
                        </ul>
                    </section>

                    <section class="policy-section policy-danger" id="pol-liability">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5"/><circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none"/></svg>16. Limitación de responsabilidad</h4>
                        <p>TaskFlow es una herramienta de apoyo personal. El usuario conserva la responsabilidad final sobre sus decisiones, acciones, entrenamiento, compras, estudios, ingresos, horarios y cumplimiento.</p>
                        <ul>
                            <li>No se garantiza funcionamiento ininterrumpido ni ausencia absoluta de errores.</li>
                            <li>No se garantiza que una notificación llegue exactamente a la hora prevista si el dispositivo restringe su funcionamiento.</li>
                            <li>Una penalización o recompensa interna no sustituye el criterio personal ni debe utilizarse para tomar decisiones perjudiciales para la salud o la estabilidad financiera.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-changes">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 8V4h4"/><path d="M5.5 5.5A8 8 0 1 1 4 14"/></svg>17. Actualizaciones y cambios de políticas</h4>
                        <p>Estas políticas pueden actualizarse cuando cambien las funciones de TaskFlow, las reglas de recompensas, la tienda, los permisos disponibles o las obligaciones legales aplicables.</p>
                        <ul>
                            <li>La fecha y versión visibles dentro de esta sección permiten identificar la política vigente.</li>
                            <li>Los cambios importantes deben reflejarse en una nueva actualización de las políticas.</li>
                            <li>Cuando se actualicen las condiciones aplicables, TaskFlow mostrará la revisión antes de permitir el acceso.</li>
                        </ul>
                    </section>

                    <section class="policy-section" id="pol-law">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v18M7 6h10M4 8l-3 6h6L4 8ZM20 8l-3 6h6l-3-6Z"/><path d="M7 21h10"/></svg>18. Marco jurídico y transparencia</h4>
                        <p>El uso y distribución de TaskFlow deben respetar las leyes aplicables del lugar donde se utilice, incluyendo las reglas relacionadas con privacidad, consumidores, propiedad intelectual y comunicaciones electrónicas cuando correspondan.</p>
                        <p>Si TaskFlow pasa de uso personal a servicio público o comercial, deberá revisarse nuevamente su documentación legal y sus obligaciones antes de ofrecerse a terceros.</p>
                    </section>

                    <section class="policy-section" id="pol-contact">
                        <h4><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M5.5 15c.6-1.8 1.5-2.7 2.5-2.7s1.9.9 2.5 2.7M13 9h5M13 12h5M13 15h3"/></svg>19. Responsable y contacto</h4>
                        <p>Esta copia de TaskFlow todavía no muestra públicamente un nombre legal, correo electrónico o dirección de contacto del responsable. Si se ofrece a otras personas, deberá añadirse un medio real de contacto y la identificación correspondiente del responsable.</p>
                    </section>
                    <section class="policy-section" id="pol-ads-topics">
                        <h4>20. Preferencias de anuncios</h4>
                        <p>Puedes elegir temas y una zona de anuncios en el menú de TaskFlow. Son preferencias voluntarias. La zona que seleccionas indica de dónde te interesa recibir anuncios. La ubicación del reloj permanece en el dispositivo.</p>
                        <p>Si activas las sugerencias, TaskFlow deduce temas generales como deportes o educación a partir de las rutinas del sistema que abres y las categorías de los anuncios que decides pulsar. Solo conserva los temas resultantes en el dispositivo. Puedes borrarlos o desactivar las sugerencias.</p>
                        <p>TaskFlow usa esas elecciones para decidir qué campañas son compatibles. Los temas se guardan en este dispositivo y el motor de anuncios los consulta al seleccionar campañas. Si eliges una zona, el servicio puede conservar una referencia seudónima de esa elección mientras esté activa para elaborar totales de audiencia. Los anunciantes reciben métricas agregadas, no las preferencias individuales.</p>
                        <p>Puedes borrar o cambiar tus elecciones desde Preferencias de anuncios. La aceptación de las políticas y el permiso del reloj son independientes de esta elección.</p>
                    </section>
                    <section class="policy-section" id="pol-membership">
                        <h4>21. Membresía Sin anuncios</h4>
                        <p>La membresía quita la publicidad en TaskFlow mientras esté activa. Puedes revisar su estado y gestionar la renovación desde la sección Sin anuncios.</p>
                        <p>PayPal procesa el pago y la renovación. TaskFlow utiliza la referencia de la suscripción, su estado y su vigencia para aplicar la membresía. Los números de tarjeta y credenciales de pago se introducen en PayPal. TaskFlow no expone la información de pago a anunciantes, otros usuarios ni al público.</p>
                        <p><a href="https://www.paypal.com/gt/legalhub/paypal/privacy-full" target="_blank" rel="noopener noreferrer">Declaración de privacidad de PayPal</a></p>
                    </section>

                </div>
                <section class="policy-focus" id="policyFocus" aria-hidden="true">
                    <button class="policy-focus-back" id="policyFocusBack" type="button"><span aria-hidden="true">←</span><span>Volver al índice de políticas</span></button>
                    <div class="policy-focus-label" id="policyFocusLabel">Sección seleccionada</div>
                    <div class="policy-focus-content" id="policyFocusContent"></div>
                </section>
            </main>
        <div class="policy-page-bottom"><button id="policyPageCloseBottom" type="button"><svg class="policy-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6"/></svg>Entendido · Volver a TaskFlow</button></div>
    </section>`;

let acceptedInMemory = false;
function isAccepted() {
  if (acceptedInMemory) return true;
  try { return localStorage.getItem(STORAGE_KEY) === VERSION; } catch (_) { return false; }
}
function install() {
  window.__TF_POLICY_MARKUP = policyMarkup;
  try {
    for (const obsolete of ['taskflow_personalizacion_v160','tf_ads_geo_gt_grid_v1','tf_ads_geo_world_grid_v1']) {
      localStorage.removeItem(obsolete);
    }
  } catch (_) {}
}
function requireAcceptance() {
  if (isAccepted()) return Promise.resolve();
  const gate = document.createElement('div');
  gate.id = 'tf161PolicyGate';
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-modal', 'true');
  gate.setAttribute('aria-labelledby', 'tf161PolicyTitle');
  gate.innerHTML = `
    <section class="tf161-onboarding-card">
      <header class="tf161-onboarding-head">
        <span class="tf161-onboarding-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v5c0 4 3 8 8 10 5-2 8-6 8-10V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg></span>
        <div><h1 id="tf161PolicyTitle" tabindex="-1">Políticas de TaskFlow</h1><p>Lee y acepta las políticas para entrar.</p></div>
      </header>
      <div class="tf161-policy-scroll" tabindex="0" aria-label="Texto de las políticas"></div>
      <footer class="tf161-onboarding-actions">
        <p role="status" hidden>Para entrar a TaskFlow, debes aceptar las políticas.</p>
        <button type="button" class="tf161-secondary">No acepto</button>
        <button type="button" class="tf161-primary">Aceptar y continuar</button>
      </footer>
    </section>`;
  const template = document.createElement('template');
  template.innerHTML = policyMarkup;
  gate.querySelector('.tf161-policy-scroll').append(
    ...template.content.querySelectorAll('.policy-section')
  );
  document.body.append(gate);
  gate.querySelector('h1').focus({preventScroll: true});
  return new Promise(resolve => {
    gate.querySelector('.tf161-secondary').addEventListener('click', () => {
      gate.querySelector('[role="status"]').hidden = false;
    });
    gate.querySelector('.tf161-primary').addEventListener('click', () => {
      acceptedInMemory = true;
      try { localStorage.setItem(STORAGE_KEY, VERSION); } catch (_) {}
      gate.remove();
      resolve();
    }, {once: true});
  });
}
window.TaskFlowPoliciesV161 = Object.freeze({requireAcceptance, isAccepted, install});
install();
})();
