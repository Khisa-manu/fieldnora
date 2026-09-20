package com.fieldnora.technician.data.model

import com.google.gson.annotations.SerializedName

data class Customer(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("companyName") val companyName: String? = null,
    @SerializedName("phone") val phone: String,
    @SerializedName("email") val email: String? = null,
    @SerializedName("address") val address: String,
    @SerializedName("county") val county: String = "Nairobi",
    @SerializedName("latitude") val latitude: Double = -1.286389,
    @SerializedName("longitude") val longitude: Double = 36.817223
)
