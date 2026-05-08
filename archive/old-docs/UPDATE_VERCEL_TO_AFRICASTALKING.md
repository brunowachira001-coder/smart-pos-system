# Update Vercel to Africa's Talking

## Current Variables (Mobitech - Need to Change)

You currently have these in Vercel:
- `MOBITECH_SENDER_ID`
- `MOBITECH_ACCOUNT`
- `MOBITECH_API_KEY`
- `SMS_PROVIDER` (probably set to "mobitech")
- `SMS_TEST_MODE`

## New Variables Needed (Africa's Talking)

You need to add/update these:

### 1. SMS_PROVIDER
- **Value**: `africastalking`
- **Action**: Edit existing or add new

### 2. AFRICASTALKING_USERNAME
- **Value**: `NYLAWIGS`
- **Action**: Add new variable

### 3. AFRICASTALKING_API_KEY
- **Value**: `atsk_cf4801923009ba91db552ef5e38d86f847732c6e2f7e0ac34a9638381823a46919d79867`
- **Action**: Add new variable

### 4. SMS_TEST_MODE
- **Value**: `false` (to go live immediately)
- **Action**: Edit existing or add new

## Step-by-Step Instructions

### Step 1: Add AFRICASTALKING_USERNAME
1. Click "Add Environment Variable" button (top right)
2. **Name**: `AFRICASTALKING_USERNAME`
3. **Value**: `NYLAWIGS`
4. **Environments**: Check all (Production, Preview, Development)
5. Click "Save"

### Step 2: Add AFRICASTALKING_API_KEY
1. Click "Add Environment Variable" button
2. **Name**: `AFRICASTALKING_API_KEY`
3. **Value**: `atsk_cf4801923009ba91db552ef5e38d86f847732c6e2f7e0ac34a9638381823a46919d79867`
4. **Environments**: Check all
5. Click "Save"

### Step 3: Update SMS_PROVIDER
1. Find `SMS_PROVIDER` in the list
2. Click the three dots (...) → Edit
3. **Change value to**: `africastalking`
4. Click "Save"

### Step 4: Update SMS_TEST_MODE
1. Find `SMS_TEST_MODE` in the list
2. Click the three dots (...) → Edit
3. **Change value to**: `false`
4. Click "Save"

### Step 5: Optional - Remove Mobitech Variables
You can delete these (not required, but cleaner):
- `MOBITECH_SENDER_ID`
- `MOBITECH_ACCOUNT`
- `MOBITECH_API_KEY`

To delete: Click three dots (...) → Delete

## Step 6: Redeploy

After adding/updating all variables:

1. Go to "Deployments" tab
2. Find latest deployment
3. Click three dots (...) → Redeploy
4. Wait ~2 minutes

## Final Configuration

After redeployment, your environment will have:

```
SMS_PROVIDER=africastalking
AFRICASTALKING_USERNAME=NYLAWIGS
AFRICASTALKING_API_KEY=atsk_cf4801923009ba91db552ef5e38d86f847732c6e2f7e0ac34a9638381823a46919d79867
SMS_TEST_MODE=false
```

## Verify It Works

1. Open your app
2. Make a test sale in POS
3. Customer should receive SMS within seconds

---

**Start with Step 1 above - add the Africa's Talking variables!**
