import { Router } from 'express';

// ==========================================
// MIDDLEWARES
// ==========================================
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isMaster } from '../middlewares/isMaster.js';

// ==========================================
// CONTROLLERS
// ==========================================

// Autenticação e Usuário
a
import { AuthUserController } from '../controllers/user/AuthUserController.js';
import { CurrentUserController } from '../controllers/user/CurrentUserController.js';
import { UpdateUserController } from '../controllers/user/UpdateUserController.js';
import { ListUsersController } from '../controllers/user/ListUsersController.js';
import { DeleteUserController } from '../controllers/user/DeleteUserController.js';

// Administração e Aprovação (MASTER)
import { ListPendingUsersController } from '../controllers/admin/ListPendingUsersController.js';
import { ApproveUserController } from '../controllers/admin/ApproveUserController.js';
import { RejectUserController } from '../controllers/admin/RejectUserController.js';

// Empresas (Enterprise)
import { CreateEnterpriseController } from '../controllers/enterprise/CreateEnterpriseController.js';
import { ListEnterprisesController } from '../controllers/enterprise/ListEnterprisesController.js';
import { GetEnterpriseController } from '../controllers/enterprise/GetEnterpriseController.js';
import { UpdateEnterpriseController } from '../controllers/enterprise/UpdateEnterpriseController.js';
import { DeleteEnterpriseController } from '../controllers/enterprise/DeleteEnterpriseController.js';

// Unidades Frias (ColdUnit - Câmaras Frias, Frigoríficos, Caminhões)
import { CreateColdUnitController } from '../controllers/coldUnit/CreateColdUnitController.js';
import { ListColdUnitsController } from '../controllers/coldUnit/ListColdUnitsController.js';
import { GetColdUnitController } from '../controllers/coldUnit/GetColdUnitController.js';
import { UpdateColdUnitController } from '../controllers/coldUnit/UpdateColdUnitController.js';
import { DeleteColdUnitController } from '../controllers/coldUnit/DeleteColdUnitController.js';

// Telemetria (TemperatureReading)
import { CreateTemperatureReadingController } from '../controllers/telemetry/CreateTemperatureReadingController.js';
import { ListTemperatureReadingsController } from '../controllers/telemetry/ListTemperatureReadingsController.js';

// Alertas (Alert)
import { ListAlertsController } from '../controllers/alert/ListAlertsController.js';
import { ResolveAlertController } from '../controllers/alert/ResolveAlertController.js';
const routes = Router();

// ==========================================
// 1. ROTAS PÚBLICAS
// ==========================================
const requestUserController = new RequestUserController();
const authUserController = new AuthUserController();

routes.post('/users/request', requestUserController.handle);
routes.post('/login', authUserController.handle);

// Endpoint público/autenticado por Token IoT para os sensores/hardware enviarem dados
const createTemperatureReadingController = new CreateTemperatureReadingController();
routes.post('/telemetry/readings', createTemperatureReadingController.handle);


// ==========================================
// 2. ROTAS DE USUÁRIO & PERFIL (AUTENTICADO)
// ==========================================
const currentUserController = new CurrentUserController();
const updateUserController = new UpdateUserController();

routes.get('/me', isAuthenticated, currentUserController.handle);
routes.put('/users', isAuthenticated, updateUserController.handle);


// ==========================================
// 3. GERENCIAMENTO DE EMPRESAS (ENTERPRISE)
// ==========================================
const createEnterpriseController = new CreateEnterpriseController();
const listEnterprisesController = new ListEnterprisesController();
const getEnterpriseController = new GetEnterpriseController();
const updateEnterpriseController = new UpdateEnterpriseController();
const deleteEnterpriseController = new DeleteEnterpriseController();

routes.post('/enterprises', isAuthenticated, isMaster, createEnterpriseController.handle);
routes.get('/enterprises', isAuthenticated, isMaster, listEnterprisesController.handle);
routes.get('/enterprises/:id', isAuthenticated, getEnterpriseController.handle);
routes.put('/enterprises/:id', isAuthenticated, isMaster, updateEnterpriseController.handle);
routes.delete('/enterprises/:id', isAuthenticated, isMaster, deleteEnterpriseController.handle);


// ==========================================
// 4. GERENCIAMENTO DE USUÁRIOS (POR EMPRESA/ADMIN)
// ==========================================
const listUsersController = new ListUsersController();
const deleteUserController = new DeleteUserController();

routes.get('/users', isAuthenticated, listUsersController.handle);
routes.delete('/users/:id', isAuthenticated, deleteUserController.handle);


// ==========================================
// 5. UNIDADES FRIAS (COLD UNITS)
// ==========================================
const createColdUnitController = new CreateColdUnitController();
const listColdUnitsController = new ListColdUnitsController();
const getColdUnitController = new GetColdUnitController();
const updateColdUnitController = new UpdateColdUnitController();
const deleteColdUnitController = new DeleteColdUnitController();

routes.post('/cold-units', isAuthenticated, createColdUnitController.handle);
routes.get('/cold-units', isAuthenticated, listColdUnitsController.handle);
routes.get('/cold-units/:id', isAuthenticated, getColdUnitController.handle);
routes.put('/cold-units/:id', isAuthenticated, updateColdUnitController.handle);
routes.delete('/cold-units/:id', isAuthenticated, deleteColdUnitController.handle);


// ==========================================
// 6. HISTÓRICO DE TELEMETRIA / TEMPERATURA
// ==========================================
const listTemperatureReadingsController = new ListTemperatureReadingsController();

// Consulta o histórico de leituras filtrado por coldUnitId e intervalo de tempo
routes.get('/cold-units/:coldUnitId/readings', isAuthenticated, listTemperatureReadingsController.handle);


// ==========================================
// 7. ALERTAS DE TEMPERATURA
// ==========================================
const listAlertsController = new ListAlertsController();
const resolveAlertController = new ResolveAlertController();

routes.get('/alerts', isAuthenticated, listAlertsController.handle);
routes.patch('/alerts/:id/resolve', isAuthenticated, resolveAlertController.handle);


// ==========================================
// 8. ROTAS MASTER (APROVAÇÕES & LICENÇAS)
// ==========================================
const listPendingUsersController = new ListPendingUsersController();
const approveUserController = new ApproveUserController();
const rejectUserController = new RejectUserController();

routes.get('/admin/pending-users', isAuthenticated, isMaster, listPendingUsersController.handle);
routes.patch('/admin/users/:id/approve', isAuthenticated, isMaster, approveUserController.handle);
routes.patch('/admin/users/:id/reject', isAuthenticated, isMaster, rejectUserController.handle);

export { routes };