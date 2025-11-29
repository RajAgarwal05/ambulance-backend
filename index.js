// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("./userSchema.js");
// const Driver = require("./driverSchema.js");
// const SosHistory = require("./SosHistory.js");



// const SECRET_KEY = "your_secret_key_here";
// const app = express();
// const server = http.createServer(app);

// app.use(cors());
// app.use(express.json());

// const MONGO_URL =
//   "mongodb+srv://yashiagar862:yashi@cluster0.yirsneg.mongodb.net/driver?retryWrites=true&w=majority&appName=Cluster0";

// // 👇 Is line ko top pe daal de (socket.io setup ke just upar)
// const userTrackingSockets = {};


// mongoose
//   .connect(MONGO_URL)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.log("❌ MongoDB connection error:", err));

// app.get("/", (req, res) => res.send("Backend running..."));

// // Store active drivers in memory
// let drivers = {};

// // ➕ Add Driver
// app.post("/add-driver", async (req, res) => {
//   try {
//     const { name, phoneNumber, ambulanceNumber, password } = req.body;
//     if (!name || !phoneNumber || !password)
//       return res.status(400).json({ success: false, message: "Missing fields" });

//     const existing = await Driver.findOne({ phoneNumber });
//     if (existing)
//       return res.status(400).json({ success: false, message: "Driver already exists" });

//     const hashed = await bcrypt.hash(password, 10);

//     const driver = await Driver.create({
//       name,
//       phoneNumber,
//       password: hashed,
//       ambulanceNumber,
//     });

//     res.json({ success: true, message: "Driver added", driver });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
// // ===================== ADMIN APIs =====================

// // Get ALL SOS history
// app.get("/admin/sos-history", async (req, res) => {
//   try {
//     const history = await SosHistory.find().sort({ createdAt: -1 });
//     res.json({ success: true, history });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // Get only ONGOING (Pending + Assigned)
// app.get("/admin/ongoing-sos", async (req, res) => {
//   try {
//     const ongoing = await SosHistory.find({
//       status: { $in: ["pending", "assigned"] }
//     }).sort({ createdAt: -1 });

//     res.json({ success: true, ongoing });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // Get COMPLETED SOS
// app.get("/admin/completed-sos", async (req, res) => {
//   try {
//     const completed = await SosHistory.find({ status: "completed" })
//       .sort({ completedAt: -1 });

//     res.json({ success: true, completed });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
// // Get ALL registered drivers
//   app.get("/admin/drivers", async (req, res) => {
//     try {
//       const drivers = await Driver.find().sort({ createdAt: -1 });
//       res.json({ success: true, drivers });
//     } catch (err) {
//       res.status(500).json({ success: false, error: err.message });
//     }
//   });


// // 🔐 Driver Login
// app.post("/driver/login", async (req, res) => {
//   try {
//     const { phoneNumber, password } = req.body;
//     const driver = await Driver.findOne({ phoneNumber });
//     if (!driver)
//       return res.status(400).json({ success: false, message: "Driver not found" });

//     const isMatch = await bcrypt.compare(password, driver.password);
//     if (!isMatch)
//       return res.status(400).json({ success: false, message: "Invalid password" });

//     const token = jwt.sign({ id: driver._id }, SECRET_KEY, { expiresIn: "7d" });

//     res.json({
//       success: true,
//       token,
//       driver: {
//         id: driver._id,
//         name: driver.name,
//         phoneNumber: driver.phoneNumber,
//         ambulanceNumber: driver.ambulanceNumber,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // 🧠 SOCKET.IO
// const io = new Server(server, {
//   cors: { origin: "*", methods: ["GET", "POST"] },
// });
// // ====================== ADMIN: DELETE DRIVER ======================
// app.delete("/admin/driver/:id", async (req, res) => {
//   try {
//     const driverId = req.params.id;
//     const deleted = await Driver.findByIdAndDelete(driverId);

//     if (!deleted)
//       return res.status(404).json({ success: false, message: "Driver not found" });

//     res.json({ success: true, message: "Driver deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // ====================== ADMIN: UPDATE DRIVER ======================
// app.put("/admin/driver/:id", async (req, res) => {
//   try {
//     const { name, phoneNumber, ambulanceNumber } = req.body;

//     const updated = await Driver.findByIdAndUpdate(
//       req.params.id,
//       { name, phoneNumber, ambulanceNumber },
//       { new: true }
//     );

//     if (!updated)
//       return res.status(404).json({ success: false, message: "Driver not found" });

//     res.json({ success: true, message: "Driver updated successfully", driver: updated });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });


// io.on("connection", (socket) => {
//   console.log("✅ New client connected:", socket.id);

//   //
//   // 1) USER starts tracking a driver (from user app)
//   //
//   socket.on("track_driver", (data) => {
//     const { driverId } = data || {};
//     if (!driverId) return console.log("track_driver missing driverId from", socket.id);
//     // store driverId as string
//     userTrackingSockets[socket.id] = String(driverId);
//     console.log(`📍 User ${socket.id} is now tracking driver ${String(driverId)}`);
//   });

//   //
//   // 2) DRIVER registration (after driver login -> emits token + optional location)
//   //
//   socket.on("driver_register", async (data) => {
//     try {
//       if (!data?.token) {
//         console.log("❌ driver_register received without token:", data);
//         return socket.emit("auth_error", "No token provided");
//       }

//       const decoded = jwt.verify(data.token, SECRET_KEY);
//       const driver = await Driver.findById(decoded.id);
//       if (!driver) {
//         console.log("❌ Driver not found for token");
//         return socket.emit("auth_error", "Driver not found");
//       }

//       // mark available and set socket id
//       driver.isAvailable = true;
//       driver.socketId = socket.id;

//       if (data.location && data.location.latitude && data.location.longitude) {
//         driver.location = {
//           latitude: data.location.latitude,
//           longitude: data.location.longitude,
//         };
//       }

//       await driver.save();

//       // store memory keyed by socket.id (important)
//       drivers[socket.id] = {
//         socketId: socket.id,
//         driverId: String(driver._id),      // string id
//         phoneNumber: driver.phoneNumber,
//         name: driver.name,
//         location: driver.location || null,
//         assignedUserSocketId: null,        // will be set when assigned
//       };

//       // store driverId on the socket (as string)
//       socket.driverId = String(driver._id);

//       console.log("✅ Driver registered:", driver.name, socket.id);
//     } catch (err) {
//       console.log("❌ driver_register error:", err.message);
//       socket.emit("auth_error", "Invalid or expired token.");
//     }
//   });

//   //
//   // 3) DRIVER sends frequent location updates
//   //
//   socket.on("driver_location", async (coords) => {
//     try {
//       // require socket to be a registered driver
//       if (!socket.driverId || !drivers[socket.id]) {
//         // Not a registered driver on this socket
//         return;
//       }

//       // update in-memory cache
//       drivers[socket.id].location = coords;

//       // update DB (by driver id)
//       await Driver.findByIdAndUpdate(socket.driverId, {
//         location: {
//           latitude: coords.latitude,
//           longitude: coords.longitude,
//         },
//       }, { new: true }).catch(e => console.log("DB update location error:", e.message));

//       console.log(`📍 Driver ${socket.driverId} loc ${coords.latitude},${coords.longitude}`);

//       // 3a) send to any user socket explicitly assigned to this driver (preferred)
//       const assignedUserSocketId = drivers[socket.id].assignedUserSocketId;
//       if (assignedUserSocketId) {
//         io.to(assignedUserSocketId).emit("driver_location_update", coords);
//       }

//       // 3b) also send to any users who requested to track this driver (track_driver)
//       const driverIdStr = String(socket.driverId);
//       for (const [userSocketId, trackingDriverId] of Object.entries(userTrackingSockets)) {
//         if (String(trackingDriverId) === driverIdStr) {
//           io.to(userSocketId).emit("driver_location_update", coords);
//         }
//       }
//     } catch (err) {
//       console.log("❌ driver_location handler error:", err.message);
//     }
//   });

//   //
//   // 4) SOS Request (from user) -> find nearest available driver and assign
//   //
//   socket.on("sos_request", async (data) => {
//     console.log("📢 SOS received:", data);
//     try {
//       const newUser = await User.create({
//         phoneNumber: data.phoneNumber,
//         location: data.location,
//         sosSent: true,
//       });
//       // 🆕 Save initial SOS history
//       const history = await SosHistory.create({
//         userPhone: data.phoneNumber,
//         userLocation: data.location,
//         status: "pending",
//       });

//       // store it on this socket
//       socket.sosHistoryId = history._id;


//       // Haversine distance helper (correct)
//       function getDistance(lat1, lon1, lat2, lon2) {
//         const R = 6371; // km
//         const dLat = ((lat2 - lat1) * Math.PI) / 180;
//         const dLon = ((lon2 - lon1) * Math.PI) / 180;
//         const a =
//           Math.sin(dLat / 2) ** 2 +
//           Math.cos((lat1 * Math.PI) / 180) *
//             Math.cos((lat2 * Math.PI) / 180) *
//             Math.sin(dLon / 2) ** 2;
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         return R * c;
//       }

//       let nearestDriverSocketId = null;
//       let minDist = Infinity;

//       for (const sid in drivers) {
//         const d = drivers[sid];
//         if (!d.location) continue;
//         // skip if driver already busy (you set isAvailable in DB; check memory if present)
//         if (d.isAvailable === false) continue;
//         const dist = getDistance(
//           data.location.latitude,
//           data.location.longitude,
//           d.location.latitude,
//           d.location.longitude
//         );
//         if (dist < minDist) {
//           minDist = dist;
//           nearestDriverSocketId = sid;
//         }
//       }

//       if (nearestDriverSocketId) {
//         const drv = drivers[nearestDriverSocketId];

//         // mark busy in memory
//         drivers[nearestDriverSocketId].isAvailable = false;
//         drivers[nearestDriverSocketId].assignedUserSocketId = socket.id; // store user socket

//         // update DB for that driver
//         const assignedDriver = await Driver.findOne({ phoneNumber: drv.phoneNumber });
//         if (assignedDriver) {
//           assignedDriver.isAvailable = false;
//           assignedDriver.assignedUser = newUser._id;
//           await assignedDriver.save();
//         }

//         // notify the driver socket
//         io.to(nearestDriverSocketId).emit("new_sos", {
//           userSocketId: socket.id,
//           phoneNumber: data.phoneNumber,
//           location: data.location,
//         });

//         // notify the user socket with driver details (driverId as string)
//         io.to(socket.id).emit("driver_assigned", {
//           driverId: assignedDriver ? String(assignedDriver._id) : drv.driverId,
//           driverName: assignedDriver ? assignedDriver.name : drv.name,
//           driverPhone: assignedDriver ? assignedDriver.phoneNumber : drv.phoneNumber,
//           ambulanceNumber: assignedDriver ? assignedDriver.ambulanceNumber : null,
          

//         });
//          // 🆕 Update SOS history when driver assigned
//           if (socket.sosHistoryId) {
//             await SosHistory.findByIdAndUpdate(socket.sosHistoryId, {
//               driverId: assignedDriver ? assignedDriver._id : drv.driverId,
//               driverName: assignedDriver ? assignedDriver.name : drv.name,
//               driverPhone: assignedDriver ? assignedDriver.phoneNumber : drv.phoneNumber,
//               ambulanceNumber: assignedDriver ? assignedDriver.ambulanceNumber : null,
//               status: "assigned",
//               assignedAt: new Date(),
//             });
//           }


//         console.log(`🚑 SOS assigned to driver ${drv.name} (${minDist.toFixed(2)} km)`);
//       } else {
//         io.to(socket.id).emit("no_driver_available", { message: "No nearby drivers found." });
//         console.log("❌ No available drivers nearby.");
//       }
//     } catch (err) {
//       console.log("❌ Error handling SOS:", err.message);
//     }
//   });

//   //
//   // 5) Driver completes trip -> free driver and inform user
//   //
//   socket.on("trip_complete", async ({ token, userSocketId }) => {
//     try {
//       const decoded = jwt.verify(token, SECRET_KEY);
//       const driver = await Driver.findById(decoded.id);
//       if (!driver) return;

//       driver.isAvailable = true;
//       driver.assignedUser = null;
//       await driver.save();
//       // 🆕 Update SOS history to completed
//       await SosHistory.findOneAndUpdate(
//         { driverId: driver._id, status: "assigned" },
//         {
//           status: "completed",
//           completedAt: new Date(),
//         }
//       );


//       // If memory entry exists for this driver socket, clear assignedUserSocketId and mark available
//       for (const sid in drivers) {
//         if (String(drivers[sid].driverId) === String(driver._id)) {
//           drivers[sid].assignedUserSocketId = null;
//           drivers[sid].isAvailable = true;
//         }
//       }

//       if (userSocketId) {
//         io.to(userSocketId).emit("trip_completed_by_driver", {
//           message: "Trip completed by driver",
//         });
//       }
//       socket.emit("trip_complete_ack", { success: true });
//     } catch (err) {
//       console.log("Trip complete error:", err.message);
//       socket.emit("trip_complete_ack", { success: false });
//     }
//   });

//   //
//   // 6) Disconnect cleanup for both user & driver
//   //
//   socket.on("disconnect", async () => {
//     console.log("❌ Client disconnected:", socket.id);
//     // remove from tracking map
//     delete userTrackingSockets[socket.id];

//     // if a driver disconnected, mark them unavailable in DB and delete memory
//     if (drivers[socket.id]) {
//       const phone = drivers[socket.id].phoneNumber;
//       await Driver.findOneAndUpdate({ phoneNumber: phone }, { isAvailable: false, socketId: null });
//       delete drivers[socket.id];
//     }
//   });
// });


// const PORT = 4000;
// server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));













require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./userSchema.js");
const Driver = require("./driverSchema.js");
const SosHistory = require("./SosHistory.js");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key_here";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb+srv://yashiagar862:yashi@cluster0.yirsneg.mongodb.net/driver?retryWrites=true&w=majority&appName=Cluster0";

// store users watching live locations
const userTrackingSockets = {};

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

app.get("/", (req, res) => res.send("Backend running..."));

// Runtime active drivers
let drivers = {};

// =====================================================
// ➕ Add Driver
// =====================================================
app.post("/add-driver", async (req, res) => {
  try {
    const { name, phoneNumber, ambulanceNumber, password } = req.body;
    if (!name || !phoneNumber || !password)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const existing = await Driver.findOne({ phoneNumber });
    if (existing)
      return res.status(400).json({ success: false, message: "Driver already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const driver = await Driver.create({
      name,
      phoneNumber,
      password: hashed,
      ambulanceNumber,
    });

    res.json({ success: true, message: "Driver added", driver });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// ADMIN APIS
// =====================================================

// ALL history
app.get("/admin/sos-history", async (req, res) => {
  try {
    const history = await SosHistory.find().sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ONGOING SOS
app.get("/admin/ongoing-sos", async (req, res) => {
  try {
    const ongoing = await SosHistory.find({
      status: { $in: ["pending", "assigned"] },
    }).sort({ createdAt: -1 });

    res.json({ success: true, ongoing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// COMPLETED SOS
app.get("/admin/completed-sos", async (req, res) => {
  try {
    const completed = await SosHistory.find({ status: "completed" }).sort({
      completedAt: -1,
    });

    res.json({ success: true, completed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ALL drivers
app.get("/admin/drivers", async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json({ success: true, drivers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE driver
app.delete("/admin/driver/:id", async (req, res) => {
  try {
    const driverId = req.params.id;
    const deleted = await Driver.findByIdAndDelete(driverId);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Driver not found" });

    res.json({ success: true, message: "Driver deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE driver
app.put("/admin/driver/:id", async (req, res) => {
  try {
    const { name, phoneNumber, ambulanceNumber } = req.body;

    const updated = await Driver.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber, ambulanceNumber },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Driver not found" });

    res.json({
      success: true,
      message: "Driver updated successfully",
      driver: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 🔐 Driver Login
// =====================================================
app.post("/driver/login", async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const driver = await Driver.findOne({ phoneNumber });
    if (!driver)
      return res.status(400).json({ success: false, message: "Driver not found" });

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: driver._id }, SECRET_KEY, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        phoneNumber: driver.phoneNumber,
        ambulanceNumber: driver.ambulanceNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 🧠 SOCKET.IO
// =====================================================
const io = new Server(server, {
  cors: { origin: "*" },
});

// 🔥 YOUR FULL SOCKET CODE — SAME AS ORIGINAL (NO CHANGE)
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("track_driver", (data) => {
    const { driverId } = data || {};
    if (!driverId)
      return console.log("track_driver missing driverId from", socket.id);

    userTrackingSockets[socket.id] = String(driverId);
    console.log(
      `📍 User ${socket.id} is now tracking driver ${String(driverId)}`
    );
  });

  socket.on("driver_register", async (data) => {
    try {
      if (!data?.token) return socket.emit("auth_error", "No token provided");

      const decoded = jwt.verify(data.token, SECRET_KEY);
      const driver = await Driver.findById(decoded.id);
      if (!driver) return socket.emit("auth_error", "Driver not found");

      driver.isAvailable = true;
      driver.socketId = socket.id;

      if (data.location?.latitude && data.location?.longitude) {
        driver.location = {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        };
      }

      await driver.save();

      drivers[socket.id] = {
        socketId: socket.id,
        driverId: String(driver._id),
        phoneNumber: driver.phoneNumber,
        name: driver.name,
        location: driver.location || null,
        assignedUserSocketId: null,
      };

      socket.driverId = String(driver._id);

      console.log("✅ Driver registered:", driver.name, socket.id);
    } catch (err) {
      socket.emit("auth_error", "Invalid or expired token.");
    }
  });

  socket.on("driver_location", async (coords) => {
    try {
      if (!socket.driverId || !drivers[socket.id]) return;

      drivers[socket.id].location = coords;

      await Driver.findByIdAndUpdate(socket.driverId, {
        location: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });

      const assignedUserSocketId = drivers[socket.id].assignedUserSocketId;
      if (assignedUserSocketId)
        io.to(assignedUserSocketId).emit("driver_location_update", coords);

      const driverIdStr = String(socket.driverId);

      Object.entries(userTrackingSockets).forEach(
        ([userSocketId, trackingDriverId]) => {
          if (String(trackingDriverId) === driverIdStr)
            io.to(userSocketId).emit("driver_location_update", coords);
        }
      );
    } catch (err) {}
  });

  // SAME SOS LOGIC (UNCHANGED)
  socket.on("sos_request", async (data) => {
    console.log("📢 SOS received:", data);

    try {
      const newUser = await User.create({
        phoneNumber: data.phoneNumber,
        location: data.location,
        sosSent: true,
      });

      const history = await SosHistory.create({
        userPhone: data.phoneNumber,
        userLocation: data.location,
        status: "pending",
      });

      socket.sosHistoryId = history._id;

      function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      }

      let nearestDriverSocketId = null;
      let minDist = Infinity;

      for (const sid in drivers) {
        const d = drivers[sid];
        if (!d.location) continue;
        if (d.isAvailable === false) continue;

        const dist = getDistance(
          data.location.latitude,
          data.location.longitude,
          d.location.latitude,
          d.location.longitude
        );

        if (dist < minDist) {
          minDist = dist;
          nearestDriverSocketId = sid;
        }
      }

      if (nearestDriverSocketId) {
        const drv = drivers[nearestDriverSocketId];

        drivers[nearestDriverSocketId].isAvailable = false;
        drivers[nearestDriverSocketId].assignedUserSocketId = socket.id;

        const assignedDriver = await Driver.findOne({
          phoneNumber: drv.phoneNumber,
        });

        if (assignedDriver) {
          assignedDriver.isAvailable = false;
          assignedDriver.assignedUser = newUser._id;
          await assignedDriver.save();
        }

        io.to(nearestDriverSocketId).emit("new_sos", {
          userSocketId: socket.id,
          phoneNumber: data.phoneNumber,
          location: data.location,
        });

        io.to(socket.id).emit("driver_assigned", {
          driverId: assignedDriver ? String(assignedDriver._id) : drv.driverId,
          driverName: assignedDriver ? assignedDriver.name : drv.name,
          driverPhone: assignedDriver
            ? assignedDriver.phoneNumber
            : drv.phoneNumber,
          ambulanceNumber: assignedDriver
            ? assignedDriver.ambulanceNumber
            : null,
        });

        if (socket.sosHistoryId) {
          await SosHistory.findByIdAndUpdate(socket.sosHistoryId, {
            driverId: assignedDriver ? assignedDriver._id : drv.driverId,
            driverName: assignedDriver ? assignedDriver.name : drv.name,
            driverPhone: assignedDriver
              ? assignedDriver.phoneNumber
              : drv.phoneNumber,
            ambulanceNumber: assignedDriver
              ? assignedDriver.ambulanceNumber
              : null,
            status: "assigned",
            assignedAt: new Date(),
          });
        }

        console.log(`🚑 SOS assigned to driver ${drv.name} (${minDist} km)`);
      } else {
        io.to(socket.id).emit("no_driver_available", {
          message: "No nearby drivers found.",
        });
      }
    } catch (err) {}
  });

  // TRIP COMPLETE
  socket.on("trip_complete", async ({ token, userSocketId }) => {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const driver = await Driver.findById(decoded.id);
      if (!driver) return;

      driver.isAvailable = true;
      driver.assignedUser = null;
      await driver.save();

      await SosHistory.findOneAndUpdate(
        { driverId: driver._id, status: "assigned" },
        {
          status: "completed",
          completedAt: new Date(),
        }
      );

      Object.keys(drivers).forEach((sid) => {
        if (drivers[sid].driverId === String(driver._id)) {
          drivers[sid].assignedUserSocketId = null;
          drivers[sid].isAvailable = true;
        }
      });

      if (userSocketId) {
        io.to(userSocketId).emit("trip_completed_by_driver", {
          message: "Trip completed",
        });
      }

      socket.emit("trip_complete_ack", { success: true });
    } catch (err) {
      socket.emit("trip_complete_ack", { success: false });
    }
  });
  // 7) USER cancels SOS
  socket.on("cancel_sos", async ({ userSocketId, driverId }) => {
    try {
      console.log("❌ User canceled SOS for driver:", driverId);

      // 1) Driver ko free karo
      await Driver.findByIdAndUpdate(driverId, {
        isAvailable: true,
        assignedUser: null,
      });

      // 2) Memory me driver ko free karo
      for (const sid in drivers) {
        if (String(drivers[sid].driverId) === String(driverId)) {
          drivers[sid].isAvailable = true;
          drivers[sid].assignedUserSocketId = null;

          // 3) Driver app ko inform
          io.to(sid).emit("sos_canceled_by_user", {
            message: "User canceled the SOS request",
          });

          break;
        }
      }

      // 4) History me update
      await SosHistory.findOneAndUpdate(
        { driverId, status: "assigned" },
        {
          status: "canceled",
          canceledAt: new Date(),
        }
      );

      console.log("🛑 SOS canceled successfully");
    } catch (err) {
      console.log("❌ cancel_sos error:", err.message);
    }
  });


  socket.on("disconnect", async () => {
    delete userTrackingSockets[socket.id];

    if (drivers[socket.id]) {
      const phone = drivers[socket.id].phoneNumber;
      await Driver.findOneAndUpdate(
        { phoneNumber: phone },
        { isAvailable: false, socketId: null }
      );

      delete drivers[socket.id];
    }

    console.log("❌ Client disconnected:", socket.id);
  });
});

// =====================================================
// PORT FOR DEPLOY
// =====================================================
const PORT = process.env.PORT || 4000;

server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
