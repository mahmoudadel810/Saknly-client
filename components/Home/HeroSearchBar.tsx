"use client";
import React from "react";
import {
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Popover,
  Typography,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";

const propertyTypes = ["شقة", "فيلا", "محلات", "عماره"];
const offerTypes = ["بيع", "إيجار"];
const locations = [
  "المنوفية",
  "شبين الكوم",
  "تلا", 
  "أشمون",
  "منوف",
  "السادات",
  "بركة السبع",
  "قويسنا",
  "الشهداء",
  "الباجور",
];

const areaMinOptions = [50, 100, 150, 200, 250, 300];
const areaMaxOptions = [300, 350, 400, 450, 500, 600];

const priceMinOptions = [100000, 200000, 300000, 400000, 500000, 600000];
const priceMaxOptions = [
  600000, 700000, 800000, 900000, 1000000, 2000000, 3000000, 5000000, 50000000,
  100000000,
];

export default function HeroSearchBar() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [propertyType, setPropertyType] = React.useState("");
  const [offerType, setOfferType] = React.useState("");
  const [location, setLocation] = React.useState("");

  const [roomsAnchorEl, setRoomsAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [selectedRooms, setSelectedRooms] = React.useState(0);
  const [selectedBaths, setSelectedBaths] = React.useState(0);

  const [areaAnchorEl, setAreaAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [minArea, setMinArea] = React.useState("");
  const [maxArea, setMaxArea] = React.useState("");
  const [areaTab, setAreaTab] = React.useState(0);

  const [priceAnchorEl, setPriceAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [priceTab, setPriceTab] = React.useState(0);

  const [offerTypeFocused, setOfferTypeFocused] = React.useState(false);
  const [locationFocused, setLocationFocused] = React.useState(false);
  const [propertyTypeFocused, setPropertyTypeFocused] = React.useState(false);

  const handleRoomsClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setRoomsAnchorEl(event.currentTarget);
  const handleRoomsClose = () => setRoomsAnchorEl(null);
  const handleRoomSelect = (count: number) => setSelectedRooms(count);
  const handleBathSelect = (count: number) => setSelectedBaths(count);
  const handleApplyRoomsBaths = () => handleRoomsClose();
  const handleResetRoomsBaths = () => {
    setSelectedRooms(0);
    setSelectedBaths(0);
  };
  const openRooms = Boolean(roomsAnchorEl);
  const idRooms = openRooms ? "rooms-baths-popover" : undefined;

  const handleAreaClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAreaAnchorEl(event.currentTarget);
  const handleAreaClose = () => setAreaAnchorEl(null);
  const handleAreaTabChange = (event: React.SyntheticEvent, newValue: number) =>
    setAreaTab(newValue);
  const handleAreaSelect = (value: number) => {
    if (areaTab === 0) setMinArea(value.toString());
    else setMaxArea(value.toString());
  };
  const handleApplyArea = () => handleAreaClose();
  const handleResetArea = () => {
    setMinArea("");
    setMaxArea("");
  };
  const openArea = Boolean(areaAnchorEl);
  const idArea = openArea ? "area-popover" : undefined;

  const handlePriceClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setPriceAnchorEl(event.currentTarget);
  const handlePriceClose = () => setPriceAnchorEl(null);
  const handlePriceTabChange = (event: React.SyntheticEvent, newValue: number) =>
    setPriceTab(newValue);
  const handlePriceSelect = (value: number) => {
    if (priceTab === 0) setMinPrice(value.toString());
    else setMaxPrice(value.toString());
  };
  const handleApplyPrice = () => handlePriceClose();
  const handleResetPrice = () => {
    setMinPrice("");
    setMaxPrice("");
  };
  const openPrice = Boolean(priceAnchorEl);
  const idPrice = openPrice ? "price-popover" : undefined;

  const handleSearchClick = () => {
    const queryParams: Record<string, string | number> = {};

    if (offerType) queryParams.category = offerType;
    if (propertyType) queryParams.type = propertyType;
    if (location) queryParams["location.city"] = location;
    if (selectedRooms) queryParams.bedrooms = selectedRooms;
    if (selectedBaths) queryParams.bathrooms = selectedBaths;

    if (minArea) queryParams["area[gte]"] = minArea;
    if (maxArea) queryParams["area[lte]"] = maxArea;
    if (minPrice) queryParams["price[gte]"] = minPrice;
    if (maxPrice) queryParams["price[lte]"] = maxPrice;

    Object.keys(queryParams).forEach(
      (key) =>
        (queryParams[key] === "" ||
          queryParams[key] === undefined ||
          queryParams[key] === null) &&
        delete queryParams[key]
    );

    const queryString = new URLSearchParams(
      queryParams as Record<string, string>
    ).toString();
    router.push(`/properties?${queryString}`);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100vw",
        overflow: "visible",
        px: { xs: 1, sm: 2, md: 3 },
        py: 2,
      }}
    >
      <Box
        sx={{
          background: "var(--card-bg)",
          borderRadius: 4,
          boxShadow: 3,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          width: "100%",
          minWidth: { xs: "300px", sm: "auto" },
          mx: "auto",
          direction: "rtl",
          alignItems: "flex-start",
          mb: 4,
          overflow: "visible",
          transition: "box-shadow 0.3s ease-in-out",
          "&:hover": {
            boxShadow: 6,
          },
          "& .MuiFormControl-root": {
            minWidth: "120px",
            overflow: "visible",
          },
          "@media (max-width: 400px)": {
            gridTemplateColumns: "1fr",
            "& .MuiFormControl-root": {
              width: "100%",
              marginBottom: "8px",
            },
          },
        }}
      >
        <FormControl
          size="small"
          sx={{
            gridColumn: { xs: "1", sm: "1", md: "1" },
            width: "100%",
          }}
        >
          <InputLabel
            id="offer-type-label"
            shrink
            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
          >
            عرض العقار
          </InputLabel>
          <Select
            labelId="offer-type-label"
            value={offerType}
            label="عرض العقار"
            onChange={(e) => setOfferType(e.target.value)}
            onFocus={() => setOfferTypeFocused(true)}
            onBlur={() => setOfferTypeFocused(false)}
            displayEmpty
            renderValue={(value) => {
              if (!value && !offerTypeFocused) {
                return (
                  <span style={{ color: "var(--text-secondary)" }}>
                    اختر نوع العرض
                  </span>
                );
              }
              return value;
            }}
            sx={{
              borderRadius: 2,
              bgcolor: "var(--card-bg)",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              "& .MuiSelect-select": {
                color: offerType
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              },
            }}
          >
            {offerTypes.map((type) => (
              <MenuItem
                key={type}
                value={type}
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{
            gridColumn: { xs: "1", sm: "2", md: "2 / span 2" },
            width: "100%",
          }}
        >
          <InputLabel
            id="location-label"
            shrink
            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
          >
            الموقع
          </InputLabel>
          <Select
            labelId="location-label"
            value={location}
            label="الموقع"
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setLocationFocused(true)}
            onBlur={() => setLocationFocused(false)}
            displayEmpty
            renderValue={(value) => {
              if (!value && !locationFocused) {
                return (
                  <span style={{ color: "var(--text-secondary)" }}>
                    اختر المدينة
                  </span>
                );
              }
              return value;
            }}
            sx={{
              borderRadius: 2,
              bgcolor: "var(--card-bg)",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              "& .MuiSelect-select": {
                color: location
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              },
            }}
          >
            {locations.map((loc) => (
              <MenuItem
                key={loc}
                value={loc}
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                {loc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{
            gridColumn: { xs: "1", sm: "1 / span 2", md: "4" },
            width: "100%",
          }}
        >
          <InputLabel
            id="property-type-label"
            shrink
            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
          >
            نوع العقار
          </InputLabel>
          <Select
            labelId="property-type-label"
            value={propertyType}
            label="نوع العقار"
            onChange={(e) => setPropertyType(e.target.value)}
            onFocus={() => setPropertyTypeFocused(true)}
            onBlur={() => setPropertyTypeFocused(false)}
            displayEmpty
            renderValue={(value) => {
              if (!value && !propertyTypeFocused) {
                return (
                  <span style={{ color: "var(--text-secondary)" }}>
                    اختر نوع العقار
                  </span>
                );
              }
              return value;
            }}
            sx={{
              borderRadius: 2,
              bgcolor: "var(--card-bg)",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              "& .MuiSelect-select": {
                color: propertyType
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              },
            }}
          >
            {propertyTypes.map((type) => (
              <MenuItem
                key={type}
                value={type}
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* غرف نوم / حمامات */}
        {propertyType !== "محلات" && (
          <FormControl
            size="small"
            sx={{
              gridColumn: { xs: "1", sm: "1", md: "1" },
              width: "100%",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <InputLabel
                shrink
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, mb: 0.5 }}
              >
                غرف نوم / حمامات
              </InputLabel>
              <Button
                variant="outlined"
                onClick={handleRoomsClick}
                sx={{
                  height: { xs: 44, sm: 48 },
                  borderColor: "var(--border-light)",
                  color: "var(--text-primary)",
                  bgcolor: "var(--card-bg)",
                  borderRadius: 2,
                  justifyContent: "space-between",
                  padding: "0 14px",
                  textTransform: "none",
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  width: "100%",
                }}
              >
                {selectedRooms || selectedBaths
                  ? `${selectedRooms || "أي"} غرفة / ${
                      selectedBaths || "أي"
                    } حمام`
                  : "كل الغرف والحمامات"}
                <span
                  style={{
                    transform: openRooms ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                >
                  &#9660;
                </span>
              </Button>
            </Box>

            <Popover
              id={idRooms}
              open={openRooms}
              anchorEl={roomsAnchorEl}
              onClose={handleRoomsClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{
                "& .MuiPaper-root": {
                  borderRadius: 2,
                  boxShadow: 3,
                  mt: 1,
                  direction: "rtl",
                  width: isMobile ? "calc(100vw - 32px)" : 300,
                  maxWidth: "none",
                },
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    textAlign: "right",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  غرف نوم
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    mb: 2,
                    justifyContent: "flex-end",
                  }}
                >
                  {[1, 2, 3, 4, 5, 6].map((count) => (
                    <Button
                      key={`room-${count}`}
                      variant={selectedRooms === count ? "contained" : "outlined"}
                      onClick={() => handleRoomSelect(count)}
                      sx={{
                        minWidth: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor:
                          selectedRooms === count
                            ? "var(--primary-500)"
                            : "var(--card-bg)",
                        color:
                          selectedRooms === count
                            ? "var(--text-white)"
                            : "var(--text-primary)",
                        borderColor:
                          selectedRooms === count
                            ? "var(--primary-500)"
                            : "var(--border-light)",
                        "&:hover": {
                          bgcolor:
                            selectedRooms === count
                              ? "var(--primary-700)"
                              : "var(--hover-overlay)",
                          borderColor: "var(--primary-500)",
                        },
                      }}
                    >
                      {count}
                    </Button>
                  ))}
                  <Button
                    variant={selectedRooms === 7 ? "contained" : "outlined"}
                    onClick={() => handleRoomSelect(7)}
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor:
                        selectedRooms === 7
                          ? "var(--primary-500)"
                          : "var(--card-bg)",
                      color:
                        selectedRooms === 7
                          ? "var(--text-white)"
                          : "var(--text-primary)",
                      borderColor:
                        selectedRooms === 7
                          ? "var(--primary-500)"
                          : "var(--border-light)",
                      "&:hover": {
                        bgcolor:
                          selectedRooms === 7
                            ? "var(--primary-700)"
                            : "var(--hover-overlay)",
                        borderColor: "var(--primary-500)",
                      },
                    }}
                  >
                    6+
                  </Button>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    textAlign: "right",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  حمامات
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    mb: 2,
                    justifyContent: "flex-end",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((count) => (
                    <Button
                      key={`bath-${count}`}
                      variant={selectedBaths === count ? "contained" : "outlined"}
                      onClick={() => handleBathSelect(count)}
                      sx={{
                        minWidth: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor:
                          selectedBaths === count
                            ? "var(--primary-500)"
                            : "var(--card-bg)",
                        color:
                          selectedBaths === count
                            ? "var(--text-white)"
                            : "var(--text-primary)",
                        borderColor:
                          selectedBaths === count
                            ? "var(--primary-500)"
                            : "var(--border-light)",
                        "&:hover": {
                          bgcolor:
                            selectedBaths === count
                              ? "var(--primary-700)"
                              : "var(--hover-overlay)",
                          borderColor: "var(--primary-500)",
                        },
                      }}
                    >
                      {count}
                    </Button>
                  ))}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleApplyRoomsBaths}
                    sx={{
                      bgcolor: "var(--primary-500)",
                      color: "var(--text-white)",
                      fontWeight: "bold",
                      borderRadius: 1,
                      flexGrow: 1,
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      "&:hover": { bgcolor: "var(--primary-700)" },
                    }}
                  >
                    تطبيق
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleResetRoomsBaths}
                    sx={{
                      color: "var(--primary-500)",
                      borderColor: "var(--primary-500)",
                      fontWeight: "bold",
                      borderRadius: 1,
                      flexGrow: 1,
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      "&:hover": {
                        bgcolor: "var(--primary-50)",
                        borderColor: "var(--primary-700)",
                      },
                    }}
                  >
                    إعادة ضبط
                  </Button>
                </Box>
              </Box>
            </Popover>
          </FormControl>
        )}

        {/* المساحة */}
        <FormControl
          size="small"
          sx={{
            gridColumn:
              propertyType === "محلات"
                ? { xs: "1", sm: "1", md: "1" }
                : { xs: "1", sm: "2", md: "2" },
            width: "100%",
          }}
        >
          <InputLabel
            id="area-button-label"
            shrink
            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
          >
            المساحة (م²)
          </InputLabel>
          <Button
            id="area-button"
            aria-describedby={idArea}
            variant="outlined"
            onClick={handleAreaClick}
            sx={{
              height: { xs: 44, sm: 48 },
              borderColor: "var(--border-light)",
              color: "var(--text-primary)",
              bgcolor: "var(--card-bg)",
              borderRadius: 2,
              justifyContent: "space-between",
              padding: "0 14px",
              textTransform: "none",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            <Box
              sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              {minArea || maxArea
                ? `${minArea || "0"} - ${maxArea || "أي"}`
                : "كل المساحات"}
            </Box>
            <span
              style={{
                transform: openArea ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                flexShrink: 0,
              }}
            >
              &#9660;
            </span>
          </Button>
          <Popover
            id={idArea}
            open={openArea}
            anchorEl={areaAnchorEl}
            onClose={handleAreaClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{
              "& .MuiPaper-root": {
                borderRadius: 2,
                boxShadow: 3,
                mt: 1,
                direction: "rtl",
                width: isMobile ? "calc(100vw - 32px)" : 300,
                maxWidth: "none",
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Tabs
                value={areaTab}
                onChange={handleAreaTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{ mb: 1 }}
              >
                <Tab
                  label="الحد الأدنى"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                />
                <Tab
                  label="الحد الأقصى"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                />
              </Tabs>
              <List sx={{ maxHeight: 200, overflowY: "auto" }}>
                {(areaTab === 0 ? areaMinOptions : areaMaxOptions).map(
                  (val) => (
                    <ListItemButton
                      key={val}
                      selected={
                        (areaTab === 0 ? minArea : maxArea) === val.toString()
                      }
                      onClick={() => handleAreaSelect(val)}
                      sx={{ justifyContent: "flex-end" }}
                    >
                      <ListItemText
                        primary={`${val} م²`}
                        sx={{
                          textAlign: "right",
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        }}
                      />
                    </ListItemButton>
                  )
                )}
              </List>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                  mt: 1,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleApplyArea}
                  sx={{
                    bgcolor: "var(--primary-500)",
                    color: "var(--text-white)",
                    fontWeight: "bold",
                    borderRadius: 1,
                    flexGrow: 1,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    "&:hover": { bgcolor: "var(--primary-700)" },
                  }}
                >
                  تطبيق
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetArea}
                  sx={{
                    color: "var(--primary-500)",
                    borderColor: "var(--primary-500)",
                    fontWeight: "bold",
                    borderRadius: 1,
                    flexGrow: 1,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    "&:hover": {
                      bgcolor: "var(--primary-50)",
                      borderColor: "var(--primary-700)",
                    },
                  }}
                >
                  إعادة ضبط
                </Button>
              </Box>
            </Box>
          </Popover>
        </FormControl>

        {/* السعر */}
        <FormControl
          size="small"
          sx={{
            gridColumn:
              propertyType === "محلات"
                ? { xs: "1", sm: "2 / span 2", md: "2 / span 2" }
                : { xs: "1", sm: "1", md: "3" },
            width: "100%",
          }}
        >
          <InputLabel
            id="price-button-label"
            shrink
            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
          >
            السعر (جنيه)
          </InputLabel>
          <Button
            id="price-button"
            aria-describedby={idPrice}
            variant="outlined"
            onClick={handlePriceClick}
            sx={{
              height: { xs: 44, sm: 48 },
              borderColor: "var(--border-light)",
              color: "var(--text-primary)",
              bgcolor: "var(--card-bg)",
              borderRadius: 2,
              justifyContent: "space-between",
              padding: "0 14px",
              textTransform: "none",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            <Box
              sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              {minPrice || maxPrice
                ? `${minPrice || "0"} - ${maxPrice || "أي"}`
                : "كل الأسعار"}
            </Box>
            <span
              style={{
                transform: openPrice ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                flexShrink: 0,
              }}
            >
              &#9660;
            </span>
          </Button>
          <Popover
            id={idPrice}
            open={openPrice}
            anchorEl={priceAnchorEl}
            onClose={handlePriceClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{
              "& .MuiPaper-root": {
                borderRadius: 2,
                boxShadow: 3,
                mt: 1,
                direction: "rtl",
                width: isMobile ? "calc(100vw - 32px)" : 300,
                maxWidth: "none",
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Tabs
                value={priceTab}
                onChange={handlePriceTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{ mb: 1 }}
              >
                <Tab
                  label="الحد الأدنى"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                />
                <Tab
                  label="الحد الأقصى"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                />
              </Tabs>
              <List sx={{ maxHeight: 200, overflowY: "auto" }}>
                {(priceTab === 0 ? priceMinOptions : priceMaxOptions).map(
                  (val) => (
                    <ListItemButton
                      key={val}
                      selected={
                        (priceTab === 0 ? minPrice : maxPrice) ===
                        val.toString()
                      }
                      onClick={() => handlePriceSelect(val)}
                      sx={{ justifyContent: "flex-end" }}
                    >
                      <ListItemText
                        primary={`$${val.toLocaleString()} جنيه`}
                        sx={{
                          textAlign: "right",
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        }}
                      />
                    </ListItemButton>
                  )
                )}
              </List>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                  mt: 1,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleApplyPrice}
                  sx={{
                    bgcolor: "var(--primary-500)",
                    color: "var(--text-white)",
                    fontWeight: "bold",
                    borderRadius: 1,
                    flexGrow: 1,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    "&:hover": { bgcolor: "var(--primary-700)" },
                  }}
                >
                  تطبيق
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetPrice}
                  sx={{
                    color: "var(--primary-500)",
                    borderColor: "var(--primary-500)",
                    fontWeight: "bold",
                    borderRadius: 1,
                    flexGrow: 1,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    "&:hover": {
                      bgcolor: "var(--primary-50)",
                      borderColor: "var(--primary-700)",
                    },
                  }}
                >
                  إعادة ضبط
                </Button>
              </Box>
            </Box>
          </Popover>
        </FormControl>

        {/* زر البحث */}
        <Box
          sx={{
            gridColumn:
              propertyType === "محلات"
                ? { xs: "1", sm: "1", md: "4" }
                : { xs: "1", sm: "2", md: "4" },
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              height: { xs: 44, sm: 48 },
              borderRadius: 2,
              bgcolor: "var(--primary-500)",
              color: "white",
              fontWeight: "bold",
              width: "100%",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              "&:hover": {
                bgcolor: "var(--primary-700)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.3s ease",
            }}
            onClick={handleSearchClick}
          >
            بحث
          </Button>
        </Box>
      </Box>
    </Box>
  );
}